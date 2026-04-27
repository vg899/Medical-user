package com.medihub.android

import android.preference.PreferenceManager
import android.os.Bundle
import android.widget.TextView
import androidx.appcompat.app.AppCompatActivity
import org.osmdroid.config.Configuration
import org.osmdroid.tileprovider.tilesource.XYTileSource
import org.osmdroid.util.GeoPoint
import org.osmdroid.views.MapView
import org.osmdroid.views.overlay.Marker
import org.osmdroid.views.overlay.Polyline

class TrackingActivity : AppCompatActivity() {

    private lateinit var mapView: MapView
    private val geoapifyKey = "8fd8b797090b479fa155228614bee82d"

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        
        // Setup osmdroid config before layout
        Configuration.getInstance().load(this, PreferenceManager.getDefaultSharedPreferences(this))
        
        setContentView(R.layout.activity_tracking)

        mapView = findViewById(R.id.mapView)
        val tvStatus = findViewById<TextView>(R.id.tvStatus)

        tvStatus.text = "Out for Delivery\nETA: 15 mins"

        // Setup Geoapify Map Tiles
        val tileSource = XYTileSource(
            "Geoapify",
            0, 20, 256, ".png",
            arrayOf("https://maps.geoapify.com/v1/tile/osm-liberty/{z}/{x}/{y}.png?apiKey=$geoapifyKey")
        )
        mapView.setTileSource(tileSource)
        mapView.setMultiTouchControls(true)

        val mapController = mapView.controller
        mapController.setZoom(14.0)

        // Mock delivery location and user location
        val userLocation = GeoPoint(12.9716, 77.5946) // Example: Bangalore
        val deliveryLocation = GeoPoint(12.9816, 77.5946)
        
        mapController.setCenter(userLocation)

        // Markers
        val userMarker = Marker(mapView).apply {
            position = userLocation
            setAnchor(Marker.ANCHOR_CENTER, Marker.ANCHOR_BOTTOM)
            title = "You"
        }
        val deliveryMarker = Marker(mapView).apply {
            position = deliveryLocation
            setAnchor(Marker.ANCHOR_CENTER, Marker.ANCHOR_BOTTOM)
            title = "Driver"
        }
        
        mapView.overlays.add(userMarker)
        mapView.overlays.add(deliveryMarker)

        // Mock Route Line
        val routeLine = Polyline().apply {
            addPoint(deliveryLocation)
            addPoint(GeoPoint(12.9750, 77.5900))
            addPoint(userLocation)
            outlinePaint.color = android.graphics.Color.BLUE
            outlinePaint.strokeWidth = 8f
        }
        mapView.overlays.add(routeLine)
    }

    override fun onResume() {
        super.onResume()
        mapView.onResume()
    }

    override fun onPause() {
        super.onPause()
        mapView.onPause()
    }
}
