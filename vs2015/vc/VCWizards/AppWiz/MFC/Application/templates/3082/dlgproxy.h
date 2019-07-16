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

// [!output DIALOG_AUTO_PROXY_HEADER]: archivo de encabezado
//

#pragma once

class [!output DIALOG_CLASS];


// Destino del comando de [!output DIALOG_AUTO_PROXY_CLASS]

class [!output DIALOG_AUTO_PROXY_CLASS] : public [!output DIALOG_AUTO_PROXY_BASE_CLASS]
{
	DECLARE_DYNCREATE([!output DIALOG_AUTO_PROXY_CLASS])

	[!output DIALOG_AUTO_PROXY_CLASS]();           // Constructor protegido utilizado por la creaci�n din�mica

// Atributos
public:
	[!output DIALOG_CLASS]* m_pDialog;

// Operaciones
public:

// Reemplazos
	public:
	virtual void OnFinalRelease();

// Implementaci�n
protected:
	virtual ~[!output DIALOG_AUTO_PROXY_CLASS]();

	// Funciones de asignaci�n de mensajes generadas

	DECLARE_MESSAGE_MAP()
	DECLARE_OLECREATE([!output DIALOG_AUTO_PROXY_CLASS])

	// Funciones de asignaci�n de env�o OLE generadas

	DECLARE_DISPATCH_MAP()
	DECLARE_INTERFACE_MAP()
};

