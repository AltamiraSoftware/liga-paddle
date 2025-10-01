
🏆 Liga de Pádel - Sistema de Gestión Deportiva
📋 Descripción del Proyecto
Este es un sistema web completo diseñado para la gestión y seguimiento de una liga de pádel. Fue desarrollado con un stack de tecnologías modernas para ofrecer una experiencia fluida. El sistema permite registrar jugadores, gestionar partidos con un formato profesional por sets, y mantener y visualizar clasificaciones y estadísticas en tiempo real.

✨ Características Principales
🎯 Gestión de Jugadores
Perfiles Completos: Permite el registro de jugadores con nombre, descripción y foto de perfil.

Almacenamiento en la Nube: Integración directa con Supabase Storage para la subida segura de imágenes.

Estadísticas de Perfil: Visualización de estadísticas detalladas del jugador mediante tooltips informativos.

🏓 Registro de Partidos
Formato Profesional: Registro de resultados desglosados por sets (Set 1, Set 2, Set 3).

Validación de Sets: Lógica implementada para controlar empates (1-1) y forzar la entrada de un tercer set.

Datos Avanzados: Registro de métricas avanzadas como Dobles Faltas (DF) por jugador.

Control de Historial: Funcionalidades de edición y eliminación para el historial completo de partidos.

📊 Clasificación y Tablas
Puntuación Automatizada: Los puntos se calculan automáticamente con la regla estándar: +3 por victoria, +1 por empate, 0 por derrota.

Actualización Instantánea: La clasificación se actualiza al momento de crear o eliminar cualquier partido.

Métricas Clave: La clasificación muestra métricas detalladas (partidos jugados, V/D/E, juegos ganados).

Diseño: Interfaz completamente responsive, optimizada tanto para dispositivos móviles como para desktop.

🛠️ Stack Tecnológico
Frontend
Herramienta	Uso Principal
React 18.2.0	Framework principal, utilizando hooks modernos.
Vite	Entorno de desarrollo y herramienta de build ultra-rápida.
Tailwind CSS	Estilado utility-first para un desarrollo rápido y diseño responsive.
JavaScript ES6+	Sintaxis moderna, manejo de asincronía con async/await.
Backend & Base de Datos
Servicio	Uso Principal
Supabase	Backend-as-a-Service, proveyendo autenticación, DB y storage.
PostgreSQL	Base de datos relacional robusta.
Stored Procedures (RPC)	Lógica de negocio crítica (actualización y reversión de estadísticas) implementada directamente en la DB.
Row Level Security (RLS)	Políticas de seguridad implementadas a nivel de fila.
DevOps & Despliegue
Vercel: Hosting y plataforma de despliegue continuo.

Git: Control de versiones.

Environment Variables: Gestión segura de credenciales.



🚀 Instalación y Configuración
Prerrequisitos
Node.js 16+

npm o yarn

Cuenta de Supabase y un proyecto activo.

Pasos de Instalación
Bash

# 1. Clonar el repositorio
git clone https://github.com/tu-usuario/liga-paddle.git
cd liga-paddle

# 2. Instalar dependencias
npm install

# 3. Configurar variables de entorno
cp .env.example .env.local
# IMPORTANTE: Editar .env.local con tus credenciales de Supabase.

# 4. Ejecutar en desarrollo
npm run dev

# 5. Build para producción
npm run build
Variables de Entorno Requeridas
Estas variables deben estar presentes en el archivo .env.local:

Fragmento de código

VITE_SUPABASE_URL=tu_url_de_supabase
VITE_SUPABASE_ANON_KEY=tu_clave_anonima
📱 Capturas de Pantalla
(Mantener los placeholders hasta tener las imágenes reales.)

Clasificación General
Formulario de Partidos
Historial
🎯 Puntos Destacados
Lógica Transaccional
La funcionalidad de eliminación de partidos es robusta: un stored procedure revierte los puntos y estadísticas de los jugadores antes de borrar el partido del historial, asegurando la integridad de los datos.

Experiencia de Usuario (UX)
El diseño prioriza la accesibilidad y es completamente adaptable a cualquier dispositivo.

Se ofrece retroalimentación visual al usuario durante todas las operaciones asíncronas (loading states).

Organización del Código
El proyecto sigue una clara separación de responsabilidades (Componentes de Presentación vs. Servicios de Datos), lo que facilita el mantenimiento y la escalabilidad.

🎓 Habilidades Demostradas
Este proyecto es una muestra de experiencia en las siguientes áreas:

Frontend Development: Manejo de useState, useEffect, composición de componentes, validación de formularios y diseño responsive con Tailwind.

Backend & Database: Integración con Supabase, diseño de queries PostgreSQL, implementación de Stored Procedures para lógica compleja y gestión de Storage.

DevOps & Deployment: Despliegue automatizado en Vercel y gestión segura de variables de entorno.

🔮 Próximas Mejoras
El proyecto está en constante evolución y las siguientes características están planeadas:

Sistema de Torneos: Implementación de brackets y lógica de eliminación directa.

Estadísticas Avanzadas: Integración de gráficos y tendencias de rendimiento.

Testing: Adición de unit tests y integration tests para las funciones críticas.

PWA: Capacidad de Progressive Web App para instalación en dispositivos móviles.

📞 Contacto
Desarrollador: Joaquín Altamirano
Email: joaquiga@ucm.es
LinkedIn: https://www.linkedin.com/in/joaqu%C3%ADn-g-46220636a/
GitHub: @AltamiraSoftware

Licencia: Este proyecto está bajo la Licencia MIT. Consulta el archivo LICENSE para más detalles.

Desarrollado con React, Supabase y Tailwind CSS