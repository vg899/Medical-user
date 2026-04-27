package com.medihub.android

data class Medicine(
    val id: String = "",
    val name: String = "",
    val description: String = "",
    val price: Double = 0.0,
    val imageUrl: String = "",
    val category: String = ""
)

data class CartItem(
    val medicine: Medicine,
    var quantity: Int = 1
)

data class Order(
    val orderId: String = "",
    val userId: String = "",
    val items: List<Map<String, Any>> = listOf(),
    val total: Double = 0.0,
    val status: String = "Pending",
    val prescriptionImage: String = "",
    val location: Map<String, Double> = mapOf(),
    val address: String = "",
    val createdAt: Long = System.currentTimeMillis()
)
