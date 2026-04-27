package com.medihub.android

import android.content.Intent
import android.net.Uri
import android.os.Bundle
import android.view.LayoutInflater
import android.view.View
import android.view.ViewGroup
import android.widget.Button
import android.widget.EditText
import android.widget.ProgressBar
import android.widget.TextView
import android.widget.Toast
import androidx.appcompat.app.AppCompatActivity
import androidx.recyclerview.widget.LinearLayoutManager
import androidx.recyclerview.widget.RecyclerView
import com.google.firebase.auth.FirebaseAuth
import com.google.firebase.firestore.FirebaseFirestore
import kotlinx.coroutines.CoroutineScope
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.launch
import kotlinx.coroutines.withContext

class CartAdapter(private val items: List<CartItem>) : RecyclerView.Adapter<CartAdapter.ViewHolder>() {
    class ViewHolder(view: View) : RecyclerView.ViewHolder(view) {
        val tvName: TextView = view.findViewById(R.id.tvName)
        val tvPrice: TextView = view.findViewById(R.id.tvPrice)
        val tvQuantity: TextView = view.findViewById(R.id.tvQuantity)
    }
    override fun onCreateViewHolder(parent: ViewGroup, viewType: Int): ViewHolder {
        val view = LayoutInflater.from(parent.context).inflate(R.layout.item_cart, parent, false)
        return ViewHolder(view)
    }
    override fun onBindViewHolder(holder: ViewHolder, position: Int) {
        val item = items[position]
        holder.tvName.text = item.medicine.name
        holder.tvPrice.text = "$${item.medicine.price}"
        holder.tvQuantity.text = "x${item.quantity}"
    }
    override fun getItemCount() = items.size
}

class CartCheckoutActivity : AppCompatActivity() {

    private lateinit var db: FirebaseFirestore
    private lateinit var auth: FirebaseAuth
    private var prescriptionUri: Uri? = null
    private val PICK_IMAGE_REQUEST = 1

    private lateinit var tvTotal: TextView
    private lateinit var progressBar: ProgressBar

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        setContentView(R.layout.activity_checkout)

        db = FirebaseFirestore.getInstance()
        auth = FirebaseAuth.getInstance()

        val rvCart = findViewById<RecyclerView>(R.id.rvCart)
        val etAddress = findViewById<EditText>(R.id.etAddress)
        val btnUploadPrescription = findViewById<Button>(R.id.btnUploadPrescription)
        val btnPlaceOrder = findViewById<Button>(R.id.btnPlaceOrder)
        tvTotal = findViewById(R.id.tvTotal)
        progressBar = findViewById(R.id.progressBar)

        rvCart.layoutManager = LinearLayoutManager(this)
        rvCart.adapter = CartAdapter(CartManager.items)

        updateTotal()

        btnUploadPrescription.setOnClickListener {
            val intent = Intent().apply {
                type = "image/*"
                action = Intent.ACTION_GET_CONTENT
            }
            startActivityForResult(Intent.createChooser(intent, "Select Prescription"), PICK_IMAGE_REQUEST)
        }

        btnPlaceOrder.setOnClickListener {
            val address = etAddress.text.toString()
            if (address.isEmpty() || CartManager.items.isEmpty()) {
                Toast.makeText(this, "Empty address or cart", Toast.LENGTH_SHORT).show()
                return@setOnClickListener
            }

            progressBar.visibility = View.VISIBLE
            CoroutineScope(Dispatchers.IO).launch {
                var prescriptionUrl = ""
                if (prescriptionUri != null) {
                    val url = CloudinaryUploader.uploadImage(this@CartCheckoutActivity, prescriptionUri!!)
                    if (url != null) prescriptionUrl = url
                }

                withContext(Dispatchers.Main) {
                    saveOrderToFirebase(address, prescriptionUrl)
                }
            }
        }
    }

    private fun updateTotal() {
        val total = CartManager.items.sumOf { it.medicine.price * it.quantity }
        tvTotal.text = "Total: $$total"
    }

    override fun onActivityResult(requestCode: Int, resultCode: Int, data: Intent?) {
        super.onActivityResult(requestCode, resultCode, data)
        if (requestCode == PICK_IMAGE_REQUEST && resultCode == RESULT_OK && data != null && data.data != null) {
            prescriptionUri = data.data
            Toast.makeText(this, "Prescription Selected", Toast.LENGTH_SHORT).show()
        }
    }

    private fun saveOrderToFirebase(address: String, prescriptionUrl: String) {
        val userId = auth.currentUser?.uid ?: "anonymous"
        val total = CartManager.items.sumOf { it.medicine.price * it.quantity }
        val orderMap = hashMapOf(
            "userId" to userId,
            "address" to address,
            "total" to total,
            "status" to "Pending",
            "prescriptionImage" to prescriptionUrl,
            "location" to mapOf("lat" to 12.9716, "lng" to 77.5946), // Mock location
            "createdAt" to System.currentTimeMillis()
        )

        db.collection("orders").add(orderMap)
            .addOnSuccessListener {
                progressBar.visibility = View.GONE
                Toast.makeText(this, "Order Placed Successfully", Toast.LENGTH_LONG).show()
                CartManager.items.clear()
                startActivity(Intent(this, TrackingActivity::class.java))
                finish()
            }
            .addOnFailureListener {
                progressBar.visibility = View.GONE
                Toast.makeText(this, "Failed to place order", Toast.LENGTH_SHORT).show()
            }
    }
}
