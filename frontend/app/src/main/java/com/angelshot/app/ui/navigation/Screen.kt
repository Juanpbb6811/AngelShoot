package com.angelshot.app.ui.navigation

sealed class Screen(val route: String) {
    object Login : Screen("login")
    object Register : Screen("register")
    object Home : Screen("home")
    object MisAlertas : Screen("mis_alertas")
    object TableroOperador : Screen("tablero_operador")
    object LocalesSeguros : Screen("locales_seguros")
}
