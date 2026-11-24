package com.lunaris.app.audio

import android.app.Notification
import android.app.NotificationChannel
import android.app.NotificationManager
import android.app.PendingIntent
import android.app.Service
import android.content.Context
import android.content.Intent
import android.content.pm.ServiceInfo
import android.graphics.Bitmap
import android.graphics.BitmapFactory
import android.net.Uri
import android.os.Binder
import android.os.Build
import android.os.IBinder
import android.support.v4.media.MediaMetadataCompat
import android.support.v4.media.session.MediaSessionCompat
import android.support.v4.media.session.PlaybackStateCompat
import androidx.core.app.NotificationCompat
import androidx.media3.common.C
import androidx.media3.common.MediaItem
import androidx.media3.common.Player
import androidx.media3.exoplayer.ExoPlayer
import java.net.URL
import kotlin.concurrent.thread

class AudioPlaybackService : Service() {

    inner class LocalBinder : Binder() {
        fun getService(): AudioPlaybackService = this@AudioPlaybackService
    }

    private val binder = LocalBinder()
    private var player: ExoPlayer? = null
    private var mediaSession: MediaSessionCompat? = null
    private var listener: PlaybackListener? = null

    private var currentTitle: String? = null
    private var currentArtist: String? = null
    private var currentAlbum: String? = null
    private var currentArtworkUrl: String? = null

    interface PlaybackListener {
        fun onStateChanged(state: String)
        fun onTimeChanged(seconds: Double)
        fun onDurationChanged(seconds: Double)
        fun onError(message: String)
    }

    fun setListener(l: PlaybackListener?) { listener = l }

    override fun onCreate() {
        super.onCreate()
        player = ExoPlayer.Builder(this).setWakeMode(C.WAKE_MODE_NETWORK).build().apply {
            addListener(object : Player.Listener {
                override fun onPlaybackStateChanged(playbackState: Int) {
                    when (playbackState) {
                        Player.STATE_READY -> {
                            listener?.onDurationChanged(duration.toDouble() / 1000.0)
                            listener?.onStateChanged(if (isPlaying) "playing" else "paused")
                            updatePlaybackState()
                            updateMetadata(currentTitle, currentArtist, currentAlbum, currentArtworkUrl)
                        }
                        Player.STATE_BUFFERING -> listener?.onStateChanged("buffering")
                        Player.STATE_ENDED -> listener?.onStateChanged("ended")
                        Player.STATE_IDLE -> {}
                    }
                }
                override fun onIsPlayingChanged(isPlaying: Boolean) {
                    listener?.onStateChanged(if (isPlaying) "playing" else "paused")
                    updatePlaybackState()
                }
                override fun onPlayerError(error: androidx.media3.common.PlaybackException) {
                    listener?.onError(error.message ?: "playback error")
                }
            })
        }
        mediaSession = MediaSessionCompat(this, "Lunaris").apply {
            setCallback(object : MediaSessionCompat.Callback() {
                override fun onPlay() { player?.play(); updatePlaybackState() }
                override fun onPause() { player?.pause(); updatePlaybackState() }
                override fun onSkipToNext() { listener?.onStateChanged("next") }
                override fun onSkipToPrevious() { listener?.onStateChanged("prev") }
                override fun onSeekTo(pos: Long) { player?.seekTo(pos); updatePlaybackState() }
                override fun onStop() { player?.stop(); updatePlaybackState() }
            })
            isActive = true
        }
        updatePlaybackState()
        startForeground(NOTIF_ID, buildNotification("Lunaris", "Ready"), ServiceInfo.FOREGROUND_SERVICE_TYPE_MEDIA_PLAYBACK)
    }

    override fun onStartCommand(intent: Intent?, flags: Int, startId: Int): Int {
        return START_STICKY
    }

    override fun onBind(intent: Intent?): IBinder = binder

    fun load(url: String, title: String?, artist: String?, album: String?, artworkUrl: String?) {
        currentTitle = title
        currentArtist = artist
        currentAlbum = album
        currentArtworkUrl = artworkUrl
        val item = MediaItem.fromUri(Uri.parse(url))
        player?.setMediaItem(item)
        player?.prepare()
        mediaSession?.isActive = true
        updateMetadata(title, artist, album, artworkUrl)
        updatePlaybackState()
        startForeground(NOTIF_ID, buildNotification(title ?: "Lunaris", artist ?: ""), ServiceInfo.FOREGROUND_SERVICE_TYPE_MEDIA_PLAYBACK)
    }

    fun play() { player?.play(); mediaSession?.isActive = true; updatePlaybackState() }
    fun pause() { player?.pause(); updatePlaybackState() }
    fun seek(seconds: Double) { player?.seekTo((seconds * 1000).toLong()); updatePlaybackState() }
    fun setVolume(v: Int) { player?.volume = (v.coerceIn(0, 100) / 100f) }

    fun currentTime(): Double = (player?.currentPosition ?: 0L).toDouble() / 1000.0
    fun duration(): Double = (player?.duration?.takeIf { it > 0 } ?: 0L).toDouble() / 1000.0

    private fun updatePlaybackState() {
        val p = player ?: return
        val state = if (p.isPlaying) PlaybackStateCompat.STATE_PLAYING else PlaybackStateCompat.STATE_PAUSED
        val pb = PlaybackStateCompat.Builder()
            .setActions(
                PlaybackStateCompat.ACTION_PLAY or
                PlaybackStateCompat.ACTION_PAUSE or
                PlaybackStateCompat.ACTION_PLAY_PAUSE or
                PlaybackStateCompat.ACTION_SEEK_TO or
                PlaybackStateCompat.ACTION_SKIP_TO_NEXT or
                PlaybackStateCompat.ACTION_SKIP_TO_PREVIOUS or
                PlaybackStateCompat.ACTION_STOP
            )
            .setState(state, p.currentPosition, 1.0f)
            .build()
        mediaSession?.setPlaybackState(pb)
    }

    private fun updateMetadata(title: String?, artist: String?, album: String?, artworkUrl: String?) {
        val dur = player?.duration?.takeIf { it > 0 } ?: 0L
        val meta = MediaMetadataCompat.Builder()
            .putString(MediaMetadataCompat.METADATA_KEY_TITLE, title ?: "")
            .putString(MediaMetadataCompat.METADATA_KEY_ARTIST, artist ?: "")
            .putString(MediaMetadataCompat.METADATA_KEY_ALBUM, album ?: "")
            .putLong(MediaMetadataCompat.METADATA_KEY_DURATION, dur)
        if (!artworkUrl.isNullOrBlank()) {
            thread {
                try {
                    val bmp = BitmapFactory.decodeStream(URL(artworkUrl).openStream())
                    meta.putBitmap(MediaMetadataCompat.METADATA_KEY_ALBUM_ART, bmp)
                    mediaSession?.setMetadata(meta.build())
                } catch (_: Exception) { }
            }
        } else {
            mediaSession?.setMetadata(meta.build())
        }
    }

    private fun buildNotification(title: String, text: String): Notification {
        val channelId = "lunaris_audio"
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) {
            val nm = getSystemService(Context.NOTIFICATION_SERVICE) as NotificationManager
            if (nm.getNotificationChannel(channelId) == null) {
                nm.createNotificationChannel(NotificationChannel(channelId, "Lunaris playback", NotificationManager.IMPORTANCE_LOW))
            }
        }
        val pi = PendingIntent.getActivity(this, 0, packageManager.getLaunchIntentForPackage(packageName), PendingIntent.FLAG_IMMUTABLE)
        return NotificationCompat.Builder(this, channelId)
            .setContentTitle(title)
            .setContentText(text)
            .setSmallIcon(android.R.drawable.ic_media_play)
            .setContentIntent(pi)
            .setOngoing(true)
            .setStyle(androidx.media.app.NotificationCompat.MediaStyle().setMediaSession(mediaSession?.sessionToken))
            .build()
    }

    override fun onDestroy() {
        player?.release()
        mediaSession?.release()
        super.onDestroy()
    }

    companion object {
        const val NOTIF_ID = 1001
    }
}