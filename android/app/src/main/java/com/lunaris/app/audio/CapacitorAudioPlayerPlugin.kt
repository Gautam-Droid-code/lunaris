package com.lunaris.app.audio

import android.content.ComponentName
import android.content.Context
import android.content.Intent
import android.content.ServiceConnection
import android.os.IBinder
import com.getcapacitor.JSObject
import com.getcapacitor.Plugin
import com.getcapacitor.PluginCall
import com.getcapacitor.PluginMethod
import com.getcapacitor.annotation.CapacitorPlugin

@CapacitorPlugin(name = "CapacitorAudioPlayer")
class CapacitorAudioPlayerPlugin : Plugin(), AudioPlaybackService.PlaybackListener {

    private var service: AudioPlaybackService? = null
    private var bound = false

    // Pending load queued when load() is called before the service is connected.
    private var pendingUrl: String? = null
    private var pendingTitle: String? = null
    private var pendingArtist: String? = null
    private var pendingAlbum: String? = null
    private var pendingArtworkUrl: String? = null
    private var hasPending: Boolean = false

    private val connection = object : ServiceConnection {
        override fun onServiceConnected(name: ComponentName?, binder: IBinder?) {
            service = (binder as AudioPlaybackService.LocalBinder).getService()
            service?.setListener(this@CapacitorAudioPlayerPlugin)
            bound = true
            if (hasPending) {
                service?.load(pendingUrl!!, pendingTitle, pendingArtist, pendingAlbum, pendingArtworkUrl)
                hasPending = false
                pendingUrl = null
                pendingTitle = null
                pendingArtist = null
                pendingAlbum = null
                pendingArtworkUrl = null
            }
        }
        override fun onServiceDisconnected(name: ComponentName?) {
            service = null
            bound = false
        }
    }

    override fun load() {
        super.load()
        val intent = Intent(context, AudioPlaybackService::class.java)
        context.startForegroundService(intent)
        context.bindService(intent, connection, Context.BIND_AUTO_CREATE)
    }

    @PluginMethod
    fun load(call: PluginCall) {
        val url = call.getString("url") ?: run { call.reject("url required"); return }
        val title = call.getString("title")
        val artist = call.getString("artist")
        val album = call.getString("album")
        val artworkUrl = call.getString("artworkUrl")
        val s = service
        if (s == null) {
            pendingUrl = url
            pendingTitle = title
            pendingArtist = artist
            pendingAlbum = album
            pendingArtworkUrl = artworkUrl
            hasPending = true
            try {
                val intent = Intent(context, AudioPlaybackService::class.java)
                context.startForegroundService(intent)
                if (!bound) context.bindService(intent, connection, Context.BIND_AUTO_CREATE)
            } catch (_: Exception) { }
            call.resolve()
            return
        }
        s.load(url, title, artist, album, artworkUrl)
        call.resolve()
    }

    @PluginMethod
    fun play(call: PluginCall) {
        service?.play()
        call.resolve()
    }

    @PluginMethod
    fun pause(call: PluginCall) {
        service?.pause()
        call.resolve()
    }

    @PluginMethod
    fun seek(call: PluginCall) {
        val seconds = call.getDouble("seconds") ?: 0.0
        service?.seek(seconds)
        call.resolve()
    }

    @PluginMethod
    fun setVolume(call: PluginCall) {
        val v = call.getInt("volume") ?: 100
        service?.setVolume(v)
        call.resolve()
    }

    @PluginMethod
    fun getCurrentTime(call: PluginCall) {
        val r = JSObject()
        r.put("value", service?.currentTime() ?: 0.0)
        call.resolve(r)
    }

    @PluginMethod
    fun getDuration(call: PluginCall) {
        val r = JSObject()
        r.put("value", service?.duration() ?: 0.0)
        call.resolve(r)
    }

    override fun onStateChanged(state: String) {
        val data = JSObject()
        data.put("state", state)
        notifyListeners("state", data)
        if (state == "next") {
            notifyListeners("next", JSObject())
        }
        if (state == "prev") {
            notifyListeners("prev", JSObject())
        }
    }

    override fun onTimeChanged(seconds: Double) {
        val data = JSObject()
        data.put("value", seconds)
        notifyListeners("time", data)
    }

    override fun onDurationChanged(seconds: Double) {
        val data = JSObject()
        data.put("value", seconds)
        notifyListeners("duration", data)
    }

    override fun onError(message: String) {
        val data = JSObject()
        data.put("message", message)
        notifyListeners("error", data)
    }

    override fun handleOnDestroy() {
        try { context.unbindService(connection) } catch (_: Exception) {}
        super.handleOnDestroy()
    }
}