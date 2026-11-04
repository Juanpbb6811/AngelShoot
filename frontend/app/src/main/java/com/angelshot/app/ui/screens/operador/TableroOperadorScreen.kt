package com.angelshot.app.ui.screens.operador

import androidx.compose.foundation.layout.*
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.foundation.lazy.items
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.*
import androidx.compose.material3.*
import androidx.compose.runtime.Composable
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import com.angelshot.app.data.model.AlertaDTO
import com.angelshot.app.data.model.EstadoAlerta
import com.angelshot.app.data.model.NivelUrgencia
import com.angelshot.app.ui.theme.AngelIce
import com.angelshot.app.ui.theme.AngelLime
import com.angelshot.app.ui.theme.AngelNeat

@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun TableroOperadorScreen(
    alertas: List<AlertaDTO>,
    onAtenderAlerta: (Long) -> Unit,
    onResolverAlerta: (Long) -> Unit,
    onBack: () -> Unit
) {
    Scaffold(
        topBar = {
            TopAppBar(
                title = { Text("Tablero de Seguridad", fontWeight = FontWeight.Bold) },
                navigationIcon = {
                    IconButton(onClick = onBack) {
                        Icon(Icons.Default.ArrowBack, contentDescription = "Atrás")
                    }
                }
            )
        }
    ) { innerPadding ->
        if (alertas.isEmpty()) {
            Box(
                modifier = Modifier
                    .fillMaxSize()
                    .padding(innerPadding),
                contentAlignment = Alignment.Center
            ) {
                Column(horizontalAlignment = Alignment.CenterHorizontally) {
                    Icon(
                        Icons.Default.CheckCircle,
                        contentDescription = null,
                        modifier = Modifier.size(64.dp),
                        tint = Color(0xFF10B981)
                    )
                    Spacer(modifier = Modifier.height(12.dp))
                    Text("No hay alertas activas en este momento", fontWeight = FontWeight.Medium)
                }
            }
        } else {
            LazyColumn(
                modifier = Modifier
                    .fillMaxSize()
                    .padding(innerPadding)
                    .padding(16.dp),
                verticalArrangement = Arrangement.spacedBy(12.dp)
            ) {
                items(alertas) { alerta ->
                    AlertaCardOperador(
                        alerta = alerta,
                        onAtender = { onAtenderAlerta(alerta.id) },
                        onResolver = { onResolverAlerta(alerta.id) }
                    )
                }
            }
        }
    }
}

@Composable
fun AlertaCardOperador(
    alerta: AlertaDTO,
    onAtender: () -> Unit,
    onResolver: () -> Unit
) {
    val badgeColor = when (alerta.nivelUrgencia) {
        NivelUrgencia.CRITICA -> AngelLime
        NivelUrgencia.ALTA -> AngelIce
        else -> AngelNeat
    }

    Card(
        modifier = Modifier.fillMaxWidth(),
        shape = RoundedCornerShape(12.dp),
        colors = CardDefaults.cardColors(containerColor = MaterialTheme.colorScheme.surfaceVariant)
    ) {
        Column(modifier = Modifier.padding(16.dp)) {
            Row(
                modifier = Modifier.fillMaxWidth(),
                horizontalArrangement = Arrangement.SpaceBetween,
                verticalAlignment = Alignment.CenterVertically
            ) {
                Text(
                    alerta.tipoAlerta.name.replace("_", " "),
                    fontWeight = FontWeight.Bold,
                    fontSize = 16.sp
                )
                Surface(
                    color = badgeColor,
                    shape = RoundedCornerShape(16.dp)
                ) {
                    Text(
                        alerta.estado.name,
                        color = Color.White,
                        fontWeight = FontWeight.Bold,
                        fontSize = 11.sp,
                        modifier = Modifier.padding(horizontal = 8.dp, vertical = 4.dp)
                    )
                }
            }

            Spacer(modifier = Modifier.height(8.dp))
            Text("📍 Ubicación: ${alerta.ubicacionDetalle ?: "No especificada"}", fontSize = 14.sp)
            if (!alerta.usuarioNombre.isNullOrBlank()) {
                Text("👤 Solicitante: ${alerta.usuarioNombre}", fontSize = 14.sp)
            }

            Spacer(modifier = Modifier.height(12.dp))
            Row(
                modifier = Modifier.fillMaxWidth(),
                horizontalArrangement = Arrangement.End
            ) {
                if (alerta.estado == EstadoAlerta.EMITIDA) {
                    Button(onClick = onAtender) {
                        Icon(Icons.Default.DirectionsRun, contentDescription = null, modifier = Modifier.size(16.dp))
                        Spacer(modifier = Modifier.width(4.dp))
                        Text("Atender")
                    }
                } else if (alerta.estado == EstadoAlerta.EN_ATENCION) {
                    Button(
                        onClick = onResolver,
                        colors = ButtonDefaults.buttonColors(containerColor = Color(0xFF10B981))
                    ) {
                        Icon(Icons.Default.Check, contentDescription = null, modifier = Modifier.size(16.dp))
                        Spacer(modifier = Modifier.width(4.dp))
                        Text("Finalizar Auxilio")
                    }
                }
            }
        }
    }
}
