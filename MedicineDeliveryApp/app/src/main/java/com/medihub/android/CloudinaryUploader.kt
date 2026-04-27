package com.medihub.android

import android.net.Uri
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.withContext
import okhttp3.MediaType.Companion.toMediaTypeOrNull
import okhttp3.MultipartBody
import okhttp3.OkHttpClient
import okhttp3.Request
import okhttp3.RequestBody.Companion.asRequestBody
import org.json.JSONObject
import java.io.File
import java.io.FileOutputStream
import java.io.InputStream
import android.content.Context

object CloudinaryUploader {
    private val client = OkHttpClient()
    private const val UPLOAD_URL = "https://api.cloudinary.com/v1_1/dnmaci6zo/image/upload"

    suspend fun uploadImage(context: Context, imageUri: Uri): String? = withContext(Dispatchers.IO) {
        try {
            val tempFile = File(context.cacheDir, "upload_temp.jpg")
            val inputStream: InputStream? = context.contentResolver.openInputStream(imageUri)
            val outputStream = FileOutputStream(tempFile)
            inputStream?.copyTo(outputStream)
            inputStream?.close()
            outputStream.close()

            val requestBody = MultipartBody.Builder()
                .setType(MultipartBody.FORM)
                .addFormDataPart("upload_preset", "ml_default")
                .addFormDataPart("file", tempFile.name, tempFile.asRequestBody("image/*".toMediaTypeOrNull()))
                .build()

            val request = Request.Builder()
                .url(UPLOAD_URL)
                .post(requestBody)
                .build()

            val response = client.newCall(request).execute()
            val responseBody = response.body?.string()
            
            tempFile.delete()

            if (response.isSuccessful && responseBody != null) {
                val jsonObject = JSONObject(responseBody)
                return@withContext jsonObject.getString("secure_url")
            }
        } catch (e: Exception) {
            e.printStackTrace()
        }
        return@withContext null
    }
}
