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

#pragma once

class CPropertiesToolBar : public CMFCToolBar
{
public:
	virtual void OnUpdateCmdUI(CFrameWnd* /*pTarget*/, BOOL bDisableIfNoHndler)
	{
		CMFCToolBar::OnUpdateCmdUI((CFrameWnd*) GetOwner(), bDisableIfNoHndler);
	}

	virtual BOOL AllowShowOnList() const { return FALSE; }
};

class CPropertiesWnd : public CDockablePane
{
// Construcci�n
public:
	CPropertiesWnd();

	void AdjustLayout();

// Atributos
public:
	void SetVSDotNetLook(BOOL bSet)
	{
		m_wndPropList.SetVSDotNetLook(bSet);
		m_wndPropList.SetGroupNameFullWidth(bSet);
	}

protected:
	CFont m_fntPropList;
	CComboBox m_wndObjectCombo;
	CPropertiesToolBar m_wndToolBar;
	CMFCPropertyGridCtrl m_wndPropList;

// Implementaci�n
public:
	virtual ~CPropertiesWnd();

protected:
	afx_msg int OnCreate(LPCREATESTRUCT lpCreateStruct);
	afx_msg void OnSize(UINT nType, int cx, int cy);
	afx_msg void OnExpandAllProperties();
	afx_msg void OnUpdateExpandAllProperties(CCmdUI* pCmdUI);
	afx_msg void OnSortProperties();
	afx_msg void OnUpdateSortProperties(CCmdUI* pCmdUI);
	afx_msg void OnProperties1();
	afx_msg void OnUpdateProperties1(CCmdUI* pCmdUI);
	afx_msg void OnProperties2();
	afx_msg void OnUpdateProperties2(CCmdUI* pCmdUI);
	afx_msg void OnSetFocus(CWnd* pOldWnd);
	afx_msg void OnSettingChange(UINT uFlags, LPCTSTR lpszSection);

	DECLARE_MESSAGE_MAP()

	void InitPropList();
	void SetPropListFont();

	int m_nComboHeight;
};

