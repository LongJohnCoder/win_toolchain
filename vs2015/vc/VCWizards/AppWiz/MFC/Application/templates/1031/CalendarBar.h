[!if RIBBON_TOOLBAR]
// In diesem MFC-Beispielquellcode wird die Verwendung der MFC Microsoft Office Fluent-Benutzeroberfl�che 
// ("Fluent-Benutzeroberfl�che") demonstriert. Der Beispielquellcode wird ausschlie�lich zu Referenzzwecken und als Erg�nzung zur 
// Microsoft Foundation Classes-Referenz und zugeh�riger elektronischer Dokumentation 
// bereitgestellt, die in der MFC C++-Bibliotheksoftware enthalten sind.  
// Lizenzbedingungen zum Kopieren, Verwenden oder Verteilen der Fluent-Benutzeroberfl�che sind separat erh�ltlich.  
// Weitere Informationen zum Lizenzierungsprogramm f�r die Fluent-Benutzeroberfl�che finden Sie unter 
// http://go.microsoft.com/fwlink/?LinkId=238214.
//
// Copyright (C) Microsoft Corporation
// Alle Rechte vorbehalten.
[!endif]

#pragma once

/////////////////////////////////////////////////////////////////////////////
// CCalendarBar-Fenster

class CCalendarBar : public CWnd
{
// Konstruktion
public:
	CCalendarBar();

// Attribute
protected:
	CMonthCalCtrl m_wndCalendar;
	int m_nMyCalendarsY;
	CImageList m_Images;

// �berschreibungen
public:
	virtual BOOL Create(const RECT& rect, CWnd* pParentWnd, UINT nID = (UINT)-1);
	virtual BOOL PreTranslateMessage(MSG *pMsg);

// Implementierung
public:
	virtual ~CCalendarBar();

protected:
	afx_msg int OnCreate(LPCREATESTRUCT lpCreateStruct);
	afx_msg BOOL OnEraseBkgnd(CDC* pDC);
	afx_msg void OnSize(UINT nType, int cx, int cy);
	afx_msg void OnPaint();
	afx_msg void OnSetFocus(CWnd *pOldWnd);

	DECLARE_MESSAGE_MAP()
};
