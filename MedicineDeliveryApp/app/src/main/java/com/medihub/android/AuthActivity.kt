package com.medihub.android

import android.content.Intent
import android.os.Bundle
import android.view.View
import android.widget.Button
import android.widget.EditText
import android.widget.ProgressBar
import android.widget.TextView
import android.widget.Toast
import androidx.appcompat.app.AppCompatActivity
import com.google.firebase.auth.FirebaseAuth

class AuthActivity : AppCompatActivity() {

    private lateinit auth: FirebaseAuth

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        setContentView(R.layout.activity_auth)

        auth = FirebaseAuth.getInstance()

        val etEmail = findViewById<EditText>(R.id.etEmail)
        val etPassword = findViewById<EditText>(R.id.etPassword)
        val btnLogin = findViewById<Button>(R.id.btnLogin)
        val btnSignup = findViewById<Button>(R.id.btnSignup)
        val tvForgotPassword = findViewById<TextView>(R.id.tvForgotPassword)
        val progressBar = findViewById<ProgressBar>(R.id.progressBar)

        btnLogin.setOnClickListener {
            val email = etEmail.text.toString()
            val password = etPassword.text.toString()
            if (email.isEmpty() || password.isEmpty()) {
                Toast.makeText(this, "Empty fields", Toast.LENGTH_SHORT).show()
                return@setOnClickListener
            }
            
            progressBar.visibility = View.VISIBLE
            auth.signInWithEmailAndPassword(email, password)
                .addOnCompleteListener(this) { task ->
                    progressBar.visibility = View.GONE
                    if (task.isSuccessful) {
                        val user = auth.currentUser
                        if (user?.isEmailVerified == true) {
                            startActivity(Intent(this, HomeActivity::class.java))
                            finish()
                        } else {
                            Toast.makeText(this, "Please verify email first", Toast.LENGTH_SHORT).show()
                            user?.sendEmailVerification()
                        }
                    } else {
                        Toast.makeText(this, "Network Error or Wrong Credentials", Toast.LENGTH_SHORT).show()
                    }
                }
        }

        btnSignup.setOnClickListener {
            val email = etEmail.text.toString()
            val password = etPassword.text.toString()
            if (email.isEmpty() || password.isEmpty()) {
                Toast.makeText(this, "Empty fields", Toast.LENGTH_SHORT).show()
                return@setOnClickListener
            }

            progressBar.visibility = View.VISIBLE
            auth.createUserWithEmailAndPassword(email, password)
                .addOnCompleteListener(this) { task ->
                    progressBar.visibility = View.GONE
                    if (task.isSuccessful) {
                        auth.currentUser?.sendEmailVerification()
                        Toast.makeText(this, "Signup success! Check email to verify.", Toast.LENGTH_LONG).show()
                    } else {
                        Toast.makeText(this, "Registration failed", Toast.LENGTH_SHORT).show()
                    }
                }
        }
        
        tvForgotPassword.setOnClickListener {
            val email = etEmail.text.toString()
            if (email.isNotEmpty()) {
                auth.sendPasswordResetEmail(email).addOnSuccessListener {
                    Toast.makeText(this, "Reset email sent to $email", Toast.LENGTH_SHORT).show()
                }
            } else {
                Toast.makeText(this, "Enter your email first", Toast.LENGTH_SHORT).show()
            }
        }
    }
}
