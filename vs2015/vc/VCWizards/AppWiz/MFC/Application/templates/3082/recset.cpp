[!if RIBBON_TOOLBAR]
// Este c�digo fuente de ejemplos de MFC muestra el uso de la interfaz de usuario Microsoft Office Fluent para MFC 
// ("interfaz de usuario Fluent") y solamente se proporciona como material de referencia para complementar la 
// documentaci�n de referencia de Microsoft Foundation Classes y la documentaci�n electr�nica relacionada 
// incluida con el software de la biblioteca de C++ de MFC.  
// Los t�rminos de licencia para copiar, usar o distribuir la interfaz de usuario Fluent est�n disponibles por separado.  
// Para obtener m�s informaci�n acerca del programa de licencia de la interfaz de usuario Fluent, visite 
// http://go.microsoft.com/fwlink/?LinkId=238214.
//
// (C) Microsoft Corporation
// Todos los derechos reservados.
[!endif]

// [!output ROWSET_IMPL]: implementaci�n de la clase [!output ROWSET_CLASS]
//

#include "stdafx.h"
#include "[!output APP_HEADER]"
#include "[!output ROWSET_HEADER]"

#ifdef _DEBUG
#define new DEBUG_NEW
#endif


// Implementaci�n de [!output ROWSET_CLASS]

[!if ODBC]
[!output ROWSET_CLASS_ODBC_IMPL]
[!endif]
