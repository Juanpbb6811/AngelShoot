package com.angelshot.app.data.local

import android.content.Context
import android.content.SharedPreferences

class TokenManager(context: Context) {

    private val prefs: SharedPreferences =
        context.getSharedPreferences("angel_shot_prefs", Context.MODE_PRIVATE)

    companion object {
        private const val KEY_TOKEN = "jwt_token"
        private const val KEY_USER_ID = "user_id"
        private const val KEY_USER_NAME = "user_name"
        private const val KEY_USER_EMAIL = "user_email"
        private const val KEY_USER_ROLES = "user_roles"
    }

    fun saveAuthData(token: String, id: Long, nombre: String, email: String, roles: List<String>) {
        prefs.edit()
            .putString(KEY_TOKEN, token)
            .putLong(KEY_USER_ID, id)
            .putString(KEY_USER_NAME, nombre)
            .putString(KEY_USER_EMAIL, email)
            .putStringSet(KEY_USER_ROLES, roles.toSet())
            .apply()
    }

    fun getToken(): String? = prefs.getString(KEY_TOKEN, null)

    fun getUserName(): String? = prefs.getString(KEY_USER_NAME, "Usuario")

    fun getUserRoles(): Set<String> = prefs.getStringSet(KEY_USER_ROLES, emptySet()) ?: emptySet()

    fun isLoggedIn(): Boolean = getToken() != null

    fun clear() {
        prefs.edit().clear().apply()
    }
}
