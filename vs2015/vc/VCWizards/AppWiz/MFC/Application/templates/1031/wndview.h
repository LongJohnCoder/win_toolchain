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

// [!output WND_VIEW_HEADER]: Schnittstelle der Klasse [!output WND_VIEW_CLASS]
//


#pragma once


// [!output WND_VIEW_CLASS]-Fenster

class [!output WND_VIEW_CLASS] : public [!output WND_VIEW_BASE_CLASS]
{
// Konstruktion
public:
	[!output WND_VIEW_CLASS]();

// Attribute
public:

// Vorg�nge
public:

// �berschreibungen
	protected:
	virtual BOOL PreCreateWindow(CREATESTRUCT& cs);

// Implementierung
public:
	virtual ~[!output WND_VIEW_CLASS]();

	// Generierte Funktionen f�r die Meldungstabellen
protected:
	afx_msg void OnPaint();
	DECLARE_MESSAGE_MAP()
};

