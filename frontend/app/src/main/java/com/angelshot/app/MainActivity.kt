package com.angelshot.app

import android.os.Bundle
import androidx.activity.ComponentActivity
import androidx.activity.compose.setContent
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.Surface
import androidx.compose.runtime.*
import androidx.compose.ui.Modifier
import androidx.navigation.compose.NavHost
import androidx.navigation.compose.composable
import androidx.navigation.compose.rememberNavController
import com.angelshot.app.ui.navigation.Screen
import com.angelshot.app.ui.screens.auth.LoginScreen
import com.angelshot.app.ui.screens.auth.RegisterScreen
import com.angelshot.app.ui.screens.operador.TableroOperadorScreen
import com.angelshot.app.ui.screens.usuario.HomeScreen
import com.angelshot.app.ui.theme.AngelShotTheme

class MainActivity : ComponentActivity() {
    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        setContent {
            AngelShotTheme {
                Surface(
                    modifier = Modifier.fillMaxSize(),
                    color = MaterialTheme.colorScheme.background
                ) {
                    val navController = rememberNavController()
                    var currentUser by remember { mutableStateOf("Usuario") }

                    NavHost(
                        navController = navController,
                        startDestination = Screen.Login.route
                    ) {
                        composable(Screen.Login.route) {
                            LoginScreen(
                                onLoginSuccess = { email, _, roles ->
                                    currentUser = email.substringBefore("@")
                                    if (roles.contains("ROLE_OPERADOR") || roles.contains("ROLE_ADMIN")) {
                                        navController.navigate(Screen.TableroOperador.route)
                                    } else {
                                        navController.navigate(Screen.Home.route)
                                    }
                                },
                                onNavigateToRegister = {
                                    navController.navigate(Screen.Register.route)
                                }
                            )
                        }

                        composable(Screen.Register.route) {
                            RegisterScreen(
                                onRegisterSuccess = {
                                    // Navigate to home or login after success
                                    navController.navigate(Screen.Login.route) {
                                        popUpTo(Screen.Login.route) { inclusive = true }
                                    }
                                },
                                onNavigateToLogin = {
                                    navController.navigate(Screen.Login.route) {
                                        popUpTo(Screen.Login.route) { inclusive = true }
                                    }
                                }
                            )
                        }

                        composable(Screen.Home.route) {
                            HomeScreen(
                                userName = currentUser,
                                onEmitirAlerta = { /* Envío de alerta */ },
                                onNavigateToMisAlertas = { /* Navegar */ },
                                onNavigateToLocales = { /* Navegar */ },
                                onLogout = {
                                    navController.navigate(Screen.Login.route) {
                                        popUpTo(0)
                                    }
                                }
                            )
                        }

                        composable(Screen.TableroOperador.route) {
                            TableroOperadorScreen(
                                alertas = emptyList(),
                                onAtenderAlerta = { },
                                onResolverAlerta = { },
                                onBack = { navController.popBackStack() }
                            )
                        }
                    }
                }
            }
        }
    }
}
