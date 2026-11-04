package com.angelshot.app.ui.screens.usuario

import androidx.compose.foundation.background
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.rememberScrollState
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.foundation.verticalScroll
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.*
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.text.style.TextAlign
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import com.angelshot.app.data.model.CrearAlertaRequest
import com.angelshot.app.data.model.TipoAlerta
import com.angelshot.app.ui.theme.AngelIce
import com.angelshot.app.ui.theme.AngelLime
import com.angelshot.app.ui.theme.AngelNeat

@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun HomeScreen(
    userName: String,
    onEmitirAlerta: (CrearAlertaRequest) -> Unit,
    onNavigateToMisAlertas: () -> Unit,
    onNavigateToLocales: () -> Unit,
    onLogout: () -> Unit
) {
    var ubicacionDetalle by remember { mutableStateOf("") }
    var mensajeConfirmacion by remember { mutableStateOf<String?>(null) }
    var modoDiscretoActivo by remember { mutableStateOf(false) }

    if (modoDiscretoActivo) {
        // Pantalla camuflada tipo notas rápidas / calculadora para seguridad
        Column(
            modifier = Modifier
                .fillMaxSize()
                .background(Color.White)
                .padding(24.dp)
        ) {
            Text(
                "Mis Notas Personales",
                style = MaterialTheme.typography.titleMedium,
                color = Color.DarkGray
            )
            Spacer(modifier = Modifier.height(16.dp))
            Text("• Lista de mercado", color = Color.Gray)
            Text("• Cita médica viernes 4:00 PM", color = Color.Gray)
            Text("• Tarea de ingeniería de software", color = Color.Gray)

            Spacer(modifier = Modifier.weight(1f))
            Button(
                onClick = { modoDiscretoActivo = false },
                colors = ButtonDefaults.buttonColors(containerColor = Color.LightGray)
            ) {
                Text("Desbloquear app", color = Color.Black)
            }
        }
        return
    }

    Scaffold(
        topBar = {
            TopAppBar(
                title = { Text("Angel Shot", fontWeight = FontWeight.Bold) },
                actions = {
                    IconButton(onClick = { modoDiscretoActivo = true }) {
                        Icon(Icons.Default.VisibilityOff, contentDescription = "Modo Discreto")
                    }
                    IconButton(onClick = onLogout) {
                        Icon(Icons.Default.ExitToApp, contentDescription = "Cerrar sesión")
                    }
                }
            )
        }
    ) { innerPadding ->
        Column(
            modifier = Modifier
                .fillMaxSize()
                .padding(innerPadding)
                .padding(16.dp)
                .verticalScroll(rememberScrollState()),
            horizontalAlignment = Alignment.CenterHorizontally
        ) {
            // Saludo de bienvenida
            Card(
                modifier = Modifier.fillMaxWidth(),
                colors = CardDefaults.cardColors(containerColor = MaterialTheme.colorScheme.primaryContainer)
            ) {
                Column(modifier = Modifier.padding(16.dp)) {
                    Text(
                        "Hola, $userName",
                        style = MaterialTheme.typography.titleLarge,
                        color = MaterialTheme.colorScheme.onPrimaryContainer
                    )
                    Text(
                        "Estás en un espacio protegido. Si te sientes incómodo(a) o en riesgo, pulsa discretamente una opción.",
                        style = MaterialTheme.typography.bodyMedium,
                        color = MaterialTheme.colorScheme.onPrimaryContainer.copy(alpha = 0.8f)
                    )
                }
            }

            Spacer(modifier = Modifier.height(16.dp))

            // Campo opcional para ubicación en el local
            OutlinedTextField(
                value = ubicacionDetalle,
                onValueChange = { ubicacionDetalle = it },
                label = { Text("Tu mesa o zona (Ej: Mesa 12, barra, baño)") },
                modifier = Modifier.fillMaxWidth(),
                singleLine = true,
                leadingIcon = { Icon(Icons.Default.Place, contentDescription = null) }
            )

            Spacer(modifier = Modifier.height(20.dp))
            Text(
                "CÓDIGOS ANGEL SHOT",
                style = MaterialTheme.typography.labelLarge,
                fontWeight = FontWeight.Bold,
                color = MaterialTheme.colorScheme.primary
            )

            Spacer(modifier = Modifier.height(12.dp))

            // Botón 1: Angel Shot Solo (Neat)
            AngelShotButton(
                titulo = "Angel Shot Solo",
                subtitulo = "Acompañamiento discreto hacia tu vehículo o salida segura",
                colorFondo = AngelNeat,
                icono = Icons.Default.DirectionsWalk,
                onClick = {
                    onEmitirAlerta(
                        CrearAlertaRequest(
                            tipoAlerta = TipoAlerta.ANGEL_SHOT_SOLO,
                            ubicacionDetalle = ubicacionDetalle.ifBlank { "Ubicación reportada desde la app" }
                        )
                    )
                    mensajeConfirmacion = "Alerta 'Angel Shot Solo' enviada. El personal de seguridad va en camino."
                }
            )

            Spacer(modifier = Modifier.height(12.dp))

            // Botón 2: Angel Shot Con Hielo (On the rocks)
            AngelShotButton(
                titulo = "Angel Shot Con Hielo",
                subtitulo = "El personal solicitará un taxi / transporte seguro para ti",
                colorFondo = AngelIce,
                icono = Icons.Default.LocalTaxi,
                onClick = {
                    onEmitirAlerta(
                        CrearAlertaRequest(
                            tipoAlerta = TipoAlerta.ANGEL_SHOT_CON_HIELO,
                            ubicacionDetalle = ubicacionDetalle.ifBlank { "Ubicación reportada desde la app" }
                        )
                    )
                    mensajeConfirmacion = "Alerta 'Angel Shot Con Hielo' enviada. Se está gestionando tu transporte."
                }
            )

            Spacer(modifier = Modifier.height(12.dp))

            // Botón 3: Angel Shot Con Lima (With lime)
            AngelShotButton(
                titulo = "Angel Shot Con Lima (Urgente)",
                subtitulo = "Peligro inminente: intervención policial o de seguridad inmediata",
                colorFondo = AngelLime,
                icono = Icons.Default.Warning,
                onClick = {
                    onEmitirAlerta(
                        CrearAlertaRequest(
                            tipoAlerta = TipoAlerta.ANGEL_SHOT_CON_LIMA,
                            ubicacionDetalle = ubicacionDetalle.ifBlank { "Urgencia máxima reportada" }
                        )
                    )
                    mensajeConfirmacion = "🚨 Alerta Crítica enviada. Se ha notificado a todo el personal de seguridad."
                }
            )

            if (mensajeConfirmacion != null) {
                Spacer(modifier = Modifier.height(16.dp))
                Card(
                    modifier = Modifier.fillMaxWidth(),
                    colors = CardDefaults.cardColors(containerColor = Color(0xFF10B981).copy(alpha = 0.2f))
                ) {
                    Text(
                        mensajeConfirmacion!!,
                        modifier = Modifier.padding(16.dp),
                        color = Color(0xFF047857),
                        fontWeight = FontWeight.Bold,
                        textAlign = TextAlign.Center
                    )
                }
            }

            Spacer(modifier = Modifier.height(24.dp))

            // Accesos directos inferiores
            Row(
                modifier = Modifier.fillMaxWidth(),
                horizontalArrangement = Arrangement.SpaceBetween
            ) {
                OutlinedButton(
                    onClick = onNavigateToMisAlertas,
                    modifier = Modifier.weight(1f)
                ) {
                    Icon(Icons.Default.History, contentDescription = null, modifier = Modifier.size(18.dp))
                    Spacer(modifier = Modifier.width(6.dp))
                    Text("Mis Alertas")
                }

                Spacer(modifier = Modifier.width(12.dp))

                OutlinedButton(
                    onClick = onNavigateToLocales,
                    modifier = Modifier.weight(1f)
                ) {
                    Icon(Icons.Default.Shield, contentDescription = null, modifier = Modifier.size(18.dp))
                    Spacer(modifier = Modifier.width(6.dp))
                    Text("Locales Seguros")
                }
            }
        }
    }
}

@Composable
fun AngelShotButton(
    titulo: String,
    subtitulo: String,
    colorFondo: Color,
    icono: androidx.compose.ui.graphics.vector.ImageVector,
    onClick: () -> Unit
) {
    Button(
        onClick = onClick,
        modifier = Modifier
            .fillMaxWidth()
            .height(84.dp),
        shape = RoundedCornerShape(12.dp),
        colors = ButtonDefaults.buttonColors(containerColor = colorFondo)
    ) {
        Row(
            modifier = Modifier.fillMaxWidth(),
            verticalAlignment = Alignment.CenterVertically
        ) {
            Icon(icono, contentDescription = null, modifier = Modifier.size(36.dp), tint = Color.White)
            Spacer(modifier = Modifier.width(16.dp))
            Column(modifier = Modifier.weight(1f)) {
                Text(titulo, fontWeight = FontWeight.Bold, fontSize = 16.sp, color = Color.White)
                Text(subtitulo, fontSize = 12.sp, color = Color.White.copy(alpha = 0.85f), maxLines = 2)
            }
        }
    }
}
