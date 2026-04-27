package com.medihub.android

import android.content.Intent
import android.os.Bundle
import android.text.Editable
import android.text.TextWatcher
import android.view.View
import android.widget.EditText
import android.widget.ProgressBar
import android.widget.Toast
import androidx.appcompat.app.AppCompatActivity
import androidx.recyclerview.widget.GridLayoutManager
import androidx.recyclerview.widget.RecyclerView
import com.google.android.material.bottomnavigation.BottomNavigationView
import com.google.firebase.firestore.FirebaseFirestore

// Singleton cart holder for simplicity
object CartManager {
    val items = mutableListOf<CartItem>()
    
    fun addToCart(medicine: Medicine) {
        val existing = items.find { it.medicine.id == medicine.id }
        if (existing != null) {
            existing.quantity++
        } else {
            items.add(CartItem(medicine, 1))
        }
    }
}

class HomeActivity : AppCompatActivity() {

    private lateinit var db: FirebaseFirestore
    private lateinit var adapter: MedicineAdapter
    private var medicineList = mutableListOf<Medicine>()

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        setContentView(R.layout.activity_home)

        db = FirebaseFirestore.getInstance()

        val rvMedicines = findViewById<RecyclerView>(R.id.rvMedicines)
        val progressBar = findViewById<ProgressBar>(R.id.progressBar)
        val etSearch = findViewById<EditText>(R.id.etSearch)
        val bottomNav = findViewById<BottomNavigationView>(R.id.bottomNavigation)

        adapter = MedicineAdapter(medicineList) { medicine ->
            CartManager.addToCart(medicine)
            Toast.makeText(this, "${medicine.name} added to cart", Toast.LENGTH_SHORT).show()
        }
        
        rvMedicines.layoutManager = GridLayoutManager(this, 2)
        rvMedicines.adapter = adapter

        fetchMedicines(progressBar)

        etSearch.addTextChangedListener(object : TextWatcher {
            override fun beforeTextChanged(s: CharSequence?, start: Int, count: Int, after: Int) {}
            override fun onTextChanged(s: CharSequence?, start: Int, before: Int, count: Int) {
                val query = s.toString().lowercase()
                val filtered = medicineList.filter { it.name.lowercase().contains(query) }
                adapter.updateList(filtered)
            }
            override fun afterTextChanged(s: Editable?) {}
        })
        
        bottomNav.setOnItemSelectedListener { item ->
            when(item.itemId) {
                R.id.nav_cart -> {
                    startActivity(Intent(this, CartCheckoutActivity::class.java))
                    true
                }
                else -> true
            }
        }
    }

    private fun fetchMedicines(progressBar: ProgressBar) {
        progressBar.visibility = View.VISIBLE
        db.collection("medicines").get()
            .addOnSuccessListener { result ->
                medicineList.clear()
                for (doc in result) {
                    val med = doc.toObject(Medicine::class.java).copy(id = doc.id)
                    medicineList.add(med)
                }
                // Mock data if database is empty for demo purposes
                if (medicineList.isEmpty()) {
                    medicineList.add(Medicine("1", "Paracetamol", "Pain relief", 5.99, "https://example.com/para.jpg", "Fever"))
                    medicineList.add(Medicine("2", "Amoxicillin", "Antibiotic", 12.50, "", "Antibiotics"))
                }
                adapter.updateList(medicineList)
                progressBar.visibility = View.GONE
            }
            .addOnFailureListener {
                progressBar.visibility = View.GONE
                Toast.makeText(this, "Failed to load medicines", Toast.LENGTH_SHORT).show()
            }
    }
}
