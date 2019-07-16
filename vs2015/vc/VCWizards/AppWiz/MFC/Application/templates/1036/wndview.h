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

// [!output WND_VIEW_HEADER] : interface de la classe [!output WND_VIEW_CLASS]
//


#pragma once


// fen�tre [!output WND_VIEW_CLASS]

class [!output WND_VIEW_CLASS] : public [!output WND_VIEW_BASE_CLASS]
{
// Construction
public:
	[!output WND_VIEW_CLASS]();

// Attributs
public:

// Op�rations
public:

// Substitutions
	protected:
	virtual BOOL PreCreateWindow(CREATESTRUCT& cs);

// Impl�mentation
public:
	virtual ~[!output WND_VIEW_CLASS]();

	// Fonctions g�n�r�es de la table des messages
protected:
	afx_msg void OnPaint();
	DECLARE_MESSAGE_MAP()
};

