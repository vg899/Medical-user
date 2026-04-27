package com.medihub.android

import android.content.Intent
import android.os.Bundle
import android.widget.Button
import android.widget.TextView
import androidx.appcompat.app.AppCompatActivity
import com.google.firebase.auth.FirebaseAuth

class ProfileActivity : AppCompatActivity() {

    private lateinit var auth: FirebaseAuth

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        setContentView(R.layout.activity_profile)

        auth = FirebaseAuth.getInstance()
        val user = auth.currentUser

        val tvName = findViewById<TextView>(R.id.tvName)
        val tvEmail = findViewById<TextView>(R.id.tvEmail)
        val btnLogout = findViewById<Button>(R.id.btnLogout)

        // Assuming display name is not set during email/password signup unless explicitly added,
        // we'll use a placeholder or split the email.
        val email = user?.email ?: "Unknown Email"
        tvEmail.text = email
        if (user?.displayName.isNullOrEmpty()) {
            tvName.text = email.substringBefore("@").replaceFirstChar { it.uppercase() }
        } else {
            tvName.text = user?.displayName
        }

        btnLogout.setOnClickListener {
            auth.signOut()
            CartManager.items.clear() // Clear cart on logout
            val intent = Intent(this, AuthActivity::class.java)
            intent.flags = Intent.FLAG_ACTIVITY_NEW_TASK or Intent.FLAG_ACTIVITY_CLEAR_TASK
            startActivity(intent)
            finish()
        }
    }
}
