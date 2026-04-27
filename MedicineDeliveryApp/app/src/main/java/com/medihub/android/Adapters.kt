package com.medihub.android

import android.view.LayoutInflater
import android.view.View
import android.view.ViewGroup
import android.widget.Button
import android.widget.ImageView
import android.widget.TextView
import androidx.recyclerview.widget.RecyclerView
import com.bumptech.glide.Glide

class MedicineAdapter(
    private var medicines: List<Medicine>,
    private val onAddToCart: (Medicine) -> Unit
) : RecyclerView.Adapter<MedicineAdapter.ViewHolder>() {

    class ViewHolder(view: View) : RecyclerView.ViewHolder(view) {
        val ivMedicine: ImageView = view.findViewById(R.id.ivMedicine)
        val tvName: TextView = view.findViewById(R.id.tvName)
        val tvPrice: TextView = view.findViewById(R.id.tvPrice)
        val btnAdd: Button = view.findViewById(R.id.btnAdd)
    }

    override fun onCreateViewHolder(parent: ViewGroup, viewType: Int): ViewHolder {
        val view = LayoutInflater.from(parent.context)
            .inflate(R.layout.item_medicine, parent, false)
        return ViewHolder(view)
    }

    override fun onBindViewHolder(holder: ViewHolder, position: Int) {
        val medicine = medicines[position]
        holder.tvName.text = medicine.name
        holder.tvPrice.text = "$${medicine.price}"
        
        // Load image (placeholder if empty)
        if (medicine.imageUrl.isNotEmpty()) {
            Glide.with(holder.itemView.context)
                .load(medicine.imageUrl)
                .into(holder.ivMedicine)
        }

        holder.btnAdd.setOnClickListener {
            onAddToCart(medicine)
        }
    }

    override fun getItemCount() = medicines.size

    fun updateList(newList: List<Medicine>) {
        medicines = newList
        notifyDataSetChanged()
    }
}
