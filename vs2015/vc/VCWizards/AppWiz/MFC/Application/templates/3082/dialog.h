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

// [!output DIALOG_HEADER]: archivo de encabezado
//

#pragma once

[!if AUTOMATION]
class [!output DIALOG_AUTO_PROXY_CLASS];

[!endif]

// Cuadro de di�logo de [!output DIALOG_CLASS]
class [!output DIALOG_CLASS] : public [!output DIALOG_BASE_CLASS]
{
[!if AUTOMATION]
	DECLARE_DYNAMIC([!output DIALOG_CLASS]);
	friend class [!output DIALOG_AUTO_PROXY_CLASS];

[!endif]
// Construcci�n
public:
	[!output DIALOG_CLASS](CWnd* pParent = NULL);	// Constructor est�ndar
[!if AUTOMATION]
	virtual ~[!output DIALOG_CLASS]();
[!endif]

// Datos del cuadro de di�logo
[!if HTML_DIALOG]
#ifdef AFX_DESIGN_TIME
	enum { IDD = IDD_[!output UPPER_CASE_SAFE_PROJECT_IDENTIFIER_NAME]_DIALOG, IDH = IDR_HTML_[!output UPPER_CASE_SAFE_PROJECT_IDENTIFIER_NAME]_DIALOG };
#endif
[!else]
#ifdef AFX_DESIGN_TIME
	enum { IDD = IDD_[!output UPPER_CASE_SAFE_PROJECT_IDENTIFIER_NAME]_DIALOG };
#endif
[!endif]

	protected:
	virtual void DoDataExchange(CDataExchange* pDX);	// Compatibilidad con DDX/DDV

[!if HTML_DIALOG]
	HRESULT OnButtonOK(IHTMLElement *pElement);
	HRESULT OnButtonCancel(IHTMLElement *pElement);
[!endif]

// Implementaci�n
protected:
[!if AUTOMATION]
	[!output DIALOG_AUTO_PROXY_CLASS]* m_pAutoProxy;
[!endif]
	HICON m_hIcon;
[!if AUTOMATION]

	BOOL CanExit();
[!endif]

	// Funciones de asignaci�n de mensajes generadas
	virtual BOOL OnInitDialog();
[!if ABOUT_BOX]	
	afx_msg void OnSysCommand(UINT nID, LPARAM lParam);
[!endif]
	afx_msg void OnPaint();
	afx_msg HCURSOR OnQueryDragIcon();
[!if AUTOMATION]
	afx_msg void OnClose();
	virtual void OnOK();
	virtual void OnCancel();
[!endif]
	DECLARE_MESSAGE_MAP()
[!if HTML_DIALOG]
	DECLARE_DHTML_EVENT_MAP()
[!endif]
};
