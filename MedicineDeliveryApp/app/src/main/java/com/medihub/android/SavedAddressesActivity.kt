package com.medihub.android

import android.app.Dialog
import android.os.Bundle
import android.view.LayoutInflater
import android.view.View
import android.view.ViewGroup
import android.widget.Button
import android.widget.EditText
import android.widget.ProgressBar
import android.widget.RadioButton
import android.widget.TextView
import android.widget.Toast
import androidx.appcompat.app.AppCompatActivity
import androidx.appcompat.widget.Toolbar
import androidx.recyclerview.widget.LinearLayoutManager
import androidx.recyclerview.widget.RecyclerView
import com.google.android.material.floatingactionbutton.FloatingActionButton
import com.google.firebase.auth.FirebaseAuth
import com.google.firebase.firestore.FirebaseFirestore
import java.util.UUID

class AddressAdapter(
    private var addresses: List<Address>,
    private val onAddressSelected: (Address) -> Unit
) : RecyclerView.Adapter<AddressAdapter.ViewHolder>() {

    class ViewHolder(view: View) : RecyclerView.ViewHolder(view) {
        val tvTitle: TextView = view.findViewById(R.id.tvTitle)
        val tvDetails: TextView = view.findViewById(R.id.tvDetails)
        val rbSelected: RadioButton = view.findViewById(R.id.rbSelected)
    }

    override fun onCreateViewHolder(parent: ViewGroup, viewType: Int): ViewHolder {
        val view = LayoutInflater.from(parent.context)
            .inflate(R.layout.item_address, parent, false)
        return ViewHolder(view)
    }

    override fun onBindViewHolder(holder: ViewHolder, position: Int) {
        val address = addresses[position]
        holder.tvTitle.text = address.title
        holder.tvDetails.text = address.details
        holder.rbSelected.isChecked = address.isSelected

        val clickListener = View.OnClickListener {
            onAddressSelected(address)
        }
        
        holder.itemView.setOnClickListener(clickListener)
        holder.rbSelected.setOnClickListener(clickListener)
    }

    override fun getItemCount() = addresses.size

    fun updateList(newList: List<Address>) {
        addresses = newList
        notifyDataSetChanged()
    }
}

class SavedAddressesActivity : AppCompatActivity() {

    private lateinit var db: FirebaseFirestore
    private lateinit var auth: FirebaseAuth
    private lateinit var adapter: AddressAdapter
    private var addresses = mutableListOf<Address>()
    
    private lateinit var progressBar: ProgressBar

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        setContentView(R.layout.activity_saved_addresses)

        val toolbar = findViewById<Toolbar>(R.id.toolbar)
        setSupportActionBar(toolbar)
        supportActionBar?.setDisplayHomeAsUpEnabled(true)
        toolbar.setNavigationOnClickListener { finish() }

        db = FirebaseFirestore.getInstance()
        auth = FirebaseAuth.getInstance()
        
        progressBar = findViewById(R.id.progressBar)
        val rvAddresses = findViewById<RecyclerView>(R.id.rvAddresses)
        val fabAddAddress = findViewById<FloatingActionButton>(R.id.fabAddAddress)
        
        adapter = AddressAdapter(addresses) { selectedAddress ->
            selectAddress(selectedAddress)
        }
        
        rvAddresses.layoutManager = LinearLayoutManager(this)
        rvAddresses.adapter = adapter
        
        fabAddAddress.setOnClickListener {
            showAddAddressDialog()
        }

        fetchAddresses()
    }

    private fun fetchAddresses() {
        val user = auth.currentUser ?: return
        progressBar.visibility = View.VISIBLE
        
        db.collection("users").document(user.uid).collection("addresses")
            .get()
            .addOnSuccessListener { result ->
                addresses.clear()
                for (doc in result) {
                    val addr = doc.toObject(Address::class.java).copy(id = doc.id)
                    addresses.add(addr)
                }
                adapter.updateList(addresses)
                progressBar.visibility = View.GONE
            }
            .addOnFailureListener {
                progressBar.visibility = View.GONE
                Toast.makeText(this, "Failed to load addresses", Toast.LENGTH_SHORT).show()
            }
    }

    private fun selectAddress(selectedAddress: Address) {
        val user = auth.currentUser ?: return
        progressBar.visibility = View.VISIBLE
        
        // Batch write to set all to false and selected to true
        val batch = db.batch()
        val collectionRef = db.collection("users").document(user.uid).collection("addresses")
        
        for (addr in addresses) {
            val docRef = collectionRef.document(addr.id)
            val isSelected = addr.id == selectedAddress.id
            batch.update(docRef, "selected", isSelected)
        }
        
        batch.commit().addOnSuccessListener {
            val updated = addresses.map { it.copy(isSelected = it.id == selectedAddress.id) }
            adapter.updateList(updated)
            progressBar.visibility = View.GONE
            Toast.makeText(this, "Address selected", Toast.LENGTH_SHORT).show()
            
            // In a real app, you might return the address back to CartCheckoutActivity here
            // using setResult(RESULT_OK, intent) and calling finish()
        }.addOnFailureListener {
            progressBar.visibility = View.GONE
            Toast.makeText(this, "Failed to update selection", Toast.LENGTH_SHORT).show()
        }
    }

    private fun showAddAddressDialog() {
        val user = auth.currentUser ?: return
        val dialog = Dialog(this)
        dialog.setContentView(R.layout.dialog_add_address)
        dialog.window?.setLayout(ViewGroup.LayoutParams.MATCH_PARENT, ViewGroup.LayoutParams.WRAP_CONTENT)
        
        val etTitle = dialog.findViewById<EditText>(R.id.etAddressTitle)
        val etDetails = dialog.findViewById<EditText>(R.id.etAddressDetails)
        val btnCancel = dialog.findViewById<Button>(R.id.btnCancel)
        val btnSave = dialog.findViewById<Button>(R.id.btnSave)
        
        btnCancel.setOnClickListener { dialog.dismiss() }
        
        btnSave.setOnClickListener {
            val title = etTitle.text.toString().trim()
            val details = etDetails.text.toString().trim()
            
            if (title.isEmpty() || details.isEmpty()) {
                Toast.makeText(this, "Please fill all fields", Toast.LENGTH_SHORT).show()
                return@setOnClickListener
            }
            
            val newAddressId = UUID.randomUUID().toString()
            val newAddress = Address(
                id = newAddressId,
                title = title,
                details = details,
                isSelected = addresses.isEmpty() // If first address, auto select
            )
            
            progressBar.visibility = View.VISIBLE
            db.collection("users").document(user.uid).collection("addresses")
                .document(newAddressId)
                .set(newAddress)
                .addOnSuccessListener {
                    dialog.dismiss()
                    fetchAddresses()
                    Toast.makeText(this, "Address added", Toast.LENGTH_SHORT).show()
                }
                .addOnFailureListener {
                    progressBar.visibility = View.GONE
                    Toast.makeText(this, "Failed to save address", Toast.LENGTH_SHORT).show()
                }
        }
        
        dialog.show()
    }
}
