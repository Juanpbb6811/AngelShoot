import java.io.File

plugins {
    id("com.android.application") version "8.3.2" apply false
    id("org.jetbrains.kotlin.android") version "1.9.23" apply false
}

// Si el proyecto reside en OneDrive, reubicar la carpeta temporal build para evitar bloqueos de Windows
if (projectDir.absolutePath.contains("OneDrive", ignoreCase = true)) {
    val localBuildBase = File(System.getProperty("user.home"), ".gradle-builds/AngelShot/root")
    layout.buildDirectory.set(localBuildBase)
}
