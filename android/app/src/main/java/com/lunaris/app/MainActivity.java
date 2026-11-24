package com.lunaris.app;

import com.getcapacitor.BridgeActivity;
import com.lunaris.app.audio.CapacitorAudioPlayerPlugin;

public class MainActivity extends BridgeActivity {
    @Override
    public void onCreate(android.os.Bundle savedInstanceState) {
        registerPlugin(CapacitorAudioPlayerPlugin.class);
        super.onCreate(savedInstanceState);
    }
}
