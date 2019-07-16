[!if RIBBON_TOOLBAR]
// Ce code source des exemples MFC illustre l'utilisation de l'interface utilisateur Microsoft Office Fluent MFC 
// (interface utilisateur "Fluent UI"). Il est fourni uniquement en tant que r�f�rence compl�mentaire du 
// Guide de r�f�rence Microsoft Foundation Classes et de la documentation �lectronique associ�e 
// inclus avec les logiciels de la biblioth�que MFC�C++.  
// Les termes du contrat de licence pour la copie, l'utilisation ou la distribution de l'interface utilisateur Fluent sont disponibles s�par�ment.  
// Pour en savoir plus sur notre programme de licence de l'interface utilisateur Fluent, visitez 
// http://go.microsoft.com/fwlink/?LinkId=238214.
//
// Copyright (C) Microsoft Corporation
// Tous droits r�serv�s.
[!endif]

// [!output DIALOG_AUTO_PROXY_IMPL] : fichier d'impl�mentation
//

#include "stdafx.h"
#include "[!output APP_HEADER]"
#include "[!output DIALOG_AUTO_PROXY_HEADER]"
#include "[!output DIALOG_HEADER]"

#ifdef _DEBUG
#define new DEBUG_NEW
#endif


// [!output DIALOG_AUTO_PROXY_CLASS]

IMPLEMENT_DYNCREATE([!output DIALOG_AUTO_PROXY_CLASS], [!output DIALOG_AUTO_PROXY_BASE_CLASS])

[!output DIALOG_AUTO_PROXY_CLASS]::[!output DIALOG_AUTO_PROXY_CLASS]()
{
	EnableAutomation();
	
	// Pour que l'application continue de s'ex�cuter tant qu'un objet Automation 
	//	est actif, le constructeur appelle AfxOleLockApp.
	AfxOleLockApp();

	// Acc�der � la bo�te de dialogue par l'interm�diaire du pointeur
	//  de la fen�tre principale de l'application.  D�finir le pointeur interne du proxy
	//  pour qu'il pointe vers la bo�te de dialogue, et d�finir le pointeur arri�re de la bo�te de dialogue pour qu'il pointe vers
	//  ce proxy.
	ASSERT_VALID(AfxGetApp()->m_pMainWnd);
	if (AfxGetApp()->m_pMainWnd)
	{
		ASSERT_KINDOF([!output DIALOG_CLASS], AfxGetApp()->m_pMainWnd);
		if (AfxGetApp()->m_pMainWnd->IsKindOf(RUNTIME_CLASS([!output DIALOG_CLASS])))
		{
			m_pDialog = reinterpret_cast<[!output DIALOG_CLASS]*>(AfxGetApp()->m_pMainWnd);
			m_pDialog->m_pAutoProxy = this;
		}
	}
}

[!output DIALOG_AUTO_PROXY_CLASS]::~[!output DIALOG_AUTO_PROXY_CLASS]()
{
	// Pour mettre fin � l'application lorsque tous les objets ont �t� cr��s
	// 	avec Automation, le destructeur appelle AfxOleUnlockApp.
	//  Cela aura notamment pour effet de d�truire la bo�te de dialogue principale
	if (m_pDialog != NULL)
		m_pDialog->m_pAutoProxy = NULL;
	AfxOleUnlockApp();
}

void [!output DIALOG_AUTO_PROXY_CLASS]::OnFinalRelease()
{
	// Lorsque la derni�re r�f�rence pour un objet automation est lib�r�e
	// OnFinalRelease est appel�.  La classe de base supprime automatiquement
	// l'objet.  Un nettoyage suppl�mentaire est requis pour votre
	// objet avant d'appeler la classe de base.

	[!output DIALOG_AUTO_PROXY_BASE_CLASS]::OnFinalRelease();
}

BEGIN_MESSAGE_MAP([!output DIALOG_AUTO_PROXY_CLASS], [!output DIALOG_AUTO_PROXY_BASE_CLASS])
END_MESSAGE_MAP()

BEGIN_DISPATCH_MAP([!output DIALOG_AUTO_PROXY_CLASS], [!output DIALOG_AUTO_PROXY_BASE_CLASS])
END_DISPATCH_MAP()

// Remarque�: La prise en charge de IID_I[!output SAFE_PROJECT_IDENTIFIER_NAME] a �t� ajout�e afin de prendre en charge la liaison de type s�curis�
//  � partir de VBA.  Cet IID doit correspondre au GUID qui est attach� � 
//  dispinterface dans le fichier .IDL.

// {[!output DISPIID_REGISTRY_FORMAT]}
static const IID IID_I[!output SAFE_PROJECT_IDENTIFIER_NAME] =
[!output DISPIID_STATIC_CONST_GUID_FORMAT];

BEGIN_INTERFACE_MAP([!output DIALOG_AUTO_PROXY_CLASS], [!output DIALOG_AUTO_PROXY_BASE_CLASS])
	INTERFACE_PART([!output DIALOG_AUTO_PROXY_CLASS], IID_I[!output SAFE_PROJECT_IDENTIFIER_NAME], Dispatch)
END_INTERFACE_MAP()

// La macro IMPLEMENT_OLECREATE2 est d�finie dans le fichier StdAfx.h de ce projet
// {[!output APP_CLSID_REGISTRY_FORMAT]}
IMPLEMENT_OLECREATE2([!output DIALOG_AUTO_PROXY_CLASS], "[!output SAFE_PROJECT_IDENTIFIER_NAME].Application", [!output APP_CLSID_IMPLEMENT_OLECREATE_FORMAT])


// gestionnaires de messages pour [!output DIALOG_AUTO_PROXY_CLASS]
