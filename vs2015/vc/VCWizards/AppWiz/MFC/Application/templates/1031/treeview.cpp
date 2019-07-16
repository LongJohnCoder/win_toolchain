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

// [!output TREE_VIEW_IMPL]: Implementierung der Klasse [!output TREE_VIEW_CLASS]
//

#include "stdafx.h"
#include "[!output APP_HEADER]"

#include "[!output DOC_HEADER]"
#include "[!output TREE_VIEW_HEADER]"

#ifdef _DEBUG
#define new DEBUG_NEW
#endif


// [!output TREE_VIEW_CLASS]

IMPLEMENT_DYNCREATE([!output TREE_VIEW_CLASS], [!output TREE_VIEW_BASE_CLASS])

BEGIN_MESSAGE_MAP([!output TREE_VIEW_CLASS], [!output TREE_VIEW_BASE_CLASS])
[!if PRINTING]
	// Standarddruckbefehle
	ON_COMMAND(ID_FILE_PRINT, &[!output TREE_VIEW_BASE_CLASS]::OnFilePrint)
	ON_COMMAND(ID_FILE_PRINT_DIRECT, &[!output TREE_VIEW_BASE_CLASS]::OnFilePrint)
	ON_COMMAND(ID_FILE_PRINT_PREVIEW, &[!output TREE_VIEW_BASE_CLASS]::OnFilePrintPreview)
[!endif]
END_MESSAGE_MAP()


// [!output TREE_VIEW_CLASS]-Erstellung/Zerst�rung

[!output TREE_VIEW_CLASS]::[!output TREE_VIEW_CLASS]()
{
[!if ACCESSIBILITY]
	EnableActiveAccessibility();
[!endif]
	// TODO: Hier Code zur Konstruktion einf�gen
}

[!output TREE_VIEW_CLASS]::~[!output TREE_VIEW_CLASS]()
{
}

BOOL [!output TREE_VIEW_CLASS]::PreCreateWindow(CREATESTRUCT& cs)
{
	// TODO: �ndern Sie die Fensterklasse oder die Stile hier, indem Sie CREATESTRUCT �ndern

	return [!output TREE_VIEW_BASE_CLASS]::PreCreateWindow(cs);
}
[!if PRINTING]


// [!output TREE_VIEW_CLASS] drucken

BOOL [!output TREE_VIEW_CLASS]::OnPreparePrinting(CPrintInfo* pInfo)
{
	// Standardvorbereitung
	return DoPreparePrinting(pInfo);
}

void [!output TREE_VIEW_CLASS]::OnDraw(CDC* /*pDC*/)
{
	[!output DOC_CLASS]* pDoc = GetDocument();
	ASSERT_VALID(pDoc);

	// TODO: Code zum Zeichnen der nativen Daten hinzuf�gen
}

void [!output TREE_VIEW_CLASS]::OnBeginPrinting(CDC* /*pDC*/, CPrintInfo* /*pInfo*/)
{
	// TODO: Zus�tzliche Initialisierung vor dem Drucken hier einf�gen
}

void [!output TREE_VIEW_CLASS]::OnEndPrinting(CDC* /*pDC*/, CPrintInfo* /*pInfo*/)
{
	// TODO: Bereinigung nach dem Drucken einf�gen
}
[!endif]

void [!output TREE_VIEW_CLASS]::OnInitialUpdate()
{
	[!output TREE_VIEW_BASE_CLASS]::OnInitialUpdate();

	// TODO: Sie k�nnen Elemente in Ihre TreeView eintragen, indem Sie �ber
	//  einen Aufruf von GetTreeCtrl() direkt auf die Baumsteuerung zugreifen.
}


// [!output TREE_VIEW_CLASS]-Diagnose

#ifdef _DEBUG
void [!output TREE_VIEW_CLASS]::AssertValid() const
{
	[!output TREE_VIEW_BASE_CLASS]::AssertValid();
}

void [!output TREE_VIEW_CLASS]::Dump(CDumpContext& dc) const
{
	[!output TREE_VIEW_BASE_CLASS]::Dump(dc);
}

[!output DOC_CLASS]* [!output TREE_VIEW_CLASS]::GetDocument() // Nichtdebugversion ist inline
{
	ASSERT(m_pDocument->IsKindOf(RUNTIME_CLASS([!output DOC_CLASS])));
	return ([!output DOC_CLASS]*)m_pDocument;
}
#endif //_DEBUG


// [!output TREE_VIEW_CLASS]-Meldungshandler
