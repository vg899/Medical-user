package com.medihub.android

import android.os.Bundle
import android.os.Handler
import android.os.Looper
import android.content.Intent
import androidx.appcompat.app.AppCompatActivity
import com.google.firebase.auth.FirebaseAuth
import com.google.firebase.FirebaseApp
import com.google.firebase.FirebaseOptions

class SplashActivity : AppCompatActivity() {
    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        setContentView(R.layout.activity_splash)

        // Initialize Firebase with the provided config manually since we might not have the google-services.json perfectly set up via AI Studio zip.
        try {
            if (FirebaseApp.getApps(this).isEmpty()) {
                val options = FirebaseOptions.Builder()
                    .setApiKey("AIzaSyBb2YKyzp4cCABzMci41crDimLZIbLKM7w")
                    .setApplicationId("1:1037218664219:web:67ab0681b7dc7843cbcdbe")
                    .setDatabaseUrl("https://rsmedihub-c425a-default-rtdb.firebaseio.com")
                    .setProjectId("rsmedihub-c425a")
                    .setStorageBucket("rsmedihub-c425a.firebasestorage.app")
                    .build()
                FirebaseApp.initializeApp(this, options)
            }
        } catch (e: Exception) {
            e.printStackTrace()
        }

        Handler(Looper.getMainLooper()).postDelayed({
            val currentUser = FirebaseAuth.getInstance().currentUser
            if (currentUser != null && currentUser.isEmailVerified) {
                startActivity(Intent(this, HomeActivity::class.java))
            } else {
                startActivity(Intent(this, AuthActivity::class.java))
            }
            finish()
        }, 2000)
    }
}
