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

// [!output WND_VIEW_HEADER]: interfaz de la clase [!output WND_VIEW_CLASS]
//


#pragma once


// Ventana de [!output WND_VIEW_CLASS]

class [!output WND_VIEW_CLASS] : public [!output WND_VIEW_BASE_CLASS]
{
// Construcci�n
public:
	[!output WND_VIEW_CLASS]();

// Atributos
public:

// Operaciones
public:

// Reemplazos
	protected:
	virtual BOOL PreCreateWindow(CREATESTRUCT& cs);

// Implementaci�n
public:
	virtual ~[!output WND_VIEW_CLASS]();

	// Funciones de asignaci�n de mensajes generadas
protected:
	afx_msg void OnPaint();
	DECLARE_MESSAGE_MAP()
};

