package com.weebhub.app;

import android.os.Bundle;
import com.getcapacitor.BridgeActivity;
import mobile.Mobile;

public class MainActivity extends BridgeActivity {
    @Override
    public void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        
        // Start the WeebHub Go server locally in the background
        String dataDir = getApplicationContext().getFilesDir().getAbsolutePath();
        Mobile.startWeebHub(dataDir, 43211);
    }
}
