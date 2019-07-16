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

// [!output APP_HEADER]: Hauptheaderdatei f�r die [!output PROJECT_NAME]-Anwendung
//
#pragma once

#ifndef __AFXWIN_H__
	#error "'stdafx.h' vor dieser Datei f�r PCH einschlie�en"
#endif

#include "resource.h"       // Hauptsymbole


// [!output APP_CLASS]:
// Siehe [!output APP_IMPL] f�r die Implementierung dieser Klasse
//

class [!output APP_CLASS] : public [!output APP_BASE_CLASS]
{
public:
	[!output APP_CLASS]();

[!if APP_TYPE_MTLD]
[!if !DOCVIEW]
	CArray<HWND, HWND> m_aryFrames;
[!else]
protected:
	CMultiDocTemplate* m_pDocTemplate;
[!endif]
public:
[!endif]

// �berschreibungen
public:
	virtual BOOL InitInstance();
[!if CONTAINER || MINI_SERVER || FULL_SERVER || CONTAINER_SERVER || AUTOMATION || OLEDB || ACTIVEX_CONTROLS || ACCESSIBILITY || RIBBON_TOOLBAR || APP_TYPE_MDI || !DOCVIEW]
	virtual int ExitInstance();
[!endif]

// Implementierung
[!if FULL_SERVER || MINI_SERVER || CONTAINER_SERVER || AUTOMATION]
	COleTemplateServer m_server;
		// Server-Objekt f�r Dokumenterstellung
[!endif]
[!if !DOCVIEW]
[!if !APP_TYPE_SDI]
protected:
	HMENU  m_hMDIMenu;
	HACCEL m_hMDIAccel;
[!endif]

public:
[!endif]
[!if ENABLE_VISUAL_STYLE_SWITCHING]
	UINT  m_nAppLook;
[!endif]
[!if MENUBAR_TOOLBAR || ADV_DOCKING_EXPLORER || ADV_DOCKING_OUTPUT || ADV_DOCKING_PROPERTIES || ADV_DOCKING_NAVIGATION]
	BOOL  m_bHiColorIcons;

[!endif]
[!if MENUBAR_TOOLBAR || RIBBON_TOOLBAR]
	virtual void PreLoadState();
	virtual void LoadCustomState();
	virtual void SaveCustomState();

[!endif]
	afx_msg void OnAppAbout();
[!if !DOCVIEW]
[!if APP_TYPE_MDI]
	afx_msg void OnFileNew();
[!endif]
[!endif]
[!if APP_TYPE_MTLD]
	afx_msg void OnFileNewFrame();
[!if DOCVIEW]
	afx_msg void OnFileNew();
[!endif]
[!endif]
	DECLARE_MESSAGE_MAP()
};

extern [!output APP_CLASS] theApp;
