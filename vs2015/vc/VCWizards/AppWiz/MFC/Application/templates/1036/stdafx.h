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

// stdafx.h�: fichier Include pour les fichiers Include syst�me standard,
// ou les fichiers Include sp�cifiques aux projets qui sont utilis�s fr�quemment,
// et sont rarement modifi�s

#pragma once

#ifndef VC_EXTRALEAN
#define VC_EXTRALEAN            // Exclure les en-t�tes Windows rarement utilis�s
#endif

#include "targetver.h"

#define _ATL_CSTRING_EXPLICIT_CONSTRUCTORS      // certains constructeurs CString seront explicites
[!if NO_MFC_CONTROLS]
#define _AFX_NO_MFC_CONTROLS_IN_DIALOGS         // supprimer la prise en charge des contr�les MFC dans les bo�tes de dialogue
[!endif]

// d�sactive le masquage MFC de certains messages d'avertissement courants et par ailleurs souvent ignor�s
#define _AFX_ALL_WARNINGS

#include <afxwin.h>         // composants MFC principaux et standard
#include <afxext.h>         // extensions MFC
[!if APP_TYPE_MTLD && !DOCVIEW]
#include <afxtempl.h>           // classes de collection MFC
[!endif]
[!if TREE_VIEW || LIST_VIEW || PROJECT_STYLE_EXPLORER]
#include <afxcview.h>
[!endif]

[!if CONTAINER || MINI_SERVER || FULL_SERVER || CONTAINER_SERVER]
#include <afxole.h>         // classes OLE MFC
[!if CONTAINER || CONTAINER_SERVER]
#include <afxodlgs.h>       // classes de bo�te de dialogue OLE MFC
[!endif]
[!endif]

[!if AUTOMATION || ACTIVEX_CONTROLS]
#include <afxdisp.h>        // Classes MFC Automation
[!endif]

[!if ACTIVE_DOC_SERVER]
#include <afxdocob.h>
[!endif]

[!if DB_SUPPORT_HEADER_ONLY || DB_VIEW_NO_FILE]
 // Ici, une prise en charge minimale des bases de donn�es est demand�e.  Aucune vue n'est s�lectionn�e.
[!endif]
[!if DB_VIEW_WITH_FILE]
 // Ici, une prise en charge des bases de donn�es est s�lectionn�e avec une vue.
[!endif]

#ifndef _AFX_NO_OLE_SUPPORT
#include <afxdtctl.h>           // Prise en charge MFC pour les contr�les communs Internet Explorer�4
#endif
#ifndef _AFX_NO_AFXCMN_SUPPORT
#include <afxcmn.h>             // Prise en charge des MFC pour les contr�les communs Windows
#endif // _AFX_NO_AFXCMN_SUPPORT
[!if MENUBAR_TOOLBAR || RIBBON_TOOLBAR || USE_VISUAL_MANAGER]

#include <afxcontrolbars.h>     // prise en charge des MFC pour les rubans et les barres de contr�les
[!endif]

[!if HTML_VIEW || HTML_EDITVIEW]
#include <afxhtml.h>                    // Prise en charge MFC du mode HTML
[!endif]

[!if SOCKETS]
#include <afxsock.h>            // Extensions du socket MFC
[!endif]

[!if RICH_EDIT_VIEW]
#include <afxrich.h>            // classes RichEdit MFC
[!endif]

[!if ATL_SUPPORT]
#include <atlbase.h>
extern CComModule _Module;
[!endif]

[!if OLEDB]
#include <atlbase.h>
#include <afxoledb.h>
#include <atlplus.h>
[!endif]
[!if DB_SUPPORT_OLEDB && DB_SUPPORT_HEADER_ONLY ]
#include <atlbase.h>
#include <afxoledb.h>
#include <atlplus.h>
[!endif]

[!if ODBC]
#include <afxdb.h>        // ODBC
[!endif]
[!if DB_SUPPORT_ODBC && DB_SUPPORT_HEADER_ONLY ]
#include <afxdb.h>        // ODBC
[!endif]

[!if HTML_DIALOG]
#include <afxdhtml.h>        // Bo�tes de dialogue HTML
[!endif]

[!if APP_TYPE_DLG]
[!if AUTOMATION]
// Cette macro est semblable � IMPLEMENT_OLECREATE, � la diff�rence qu'elle passe au constructeur COleObjectFactory
// la valeur TRUE pour le param�tre bMultiInstance.
// Une instance distincte de cette application doit �tre lanc�e pour
// chaque objet proxy Automation demand� par les contr�leurs Automation.
#ifndef IMPLEMENT_OLECREATE2
#define IMPLEMENT_OLECREATE2(class_name, external_name, l, w1, w2, b1, b2, b3, b4, b5, b6, b7, b8) \
        AFX_DATADEF COleObjectFactory class_name::factory(class_name::guid, \
                RUNTIME_CLASS(class_name), TRUE, _T(external_name)); \
        const AFX_DATADEF GUID class_name::guid = \
                { l, w1, w2, { b1, b2, b3, b4, b5, b6, b7, b8 } };
#endif // IMPLEMENT_OLECREATE2
[!endif]
[!endif]

[!if MANIFEST]
#ifdef _UNICODE
#if defined _M_IX86
#pragma comment(linker,"/manifestdependency:\"type='win32' name='Microsoft.Windows.Common-Controls' version='6.0.0.0' processorArchitecture='x86' publicKeyToken='6595b64144ccf1df' language='*'\"")
#elif defined _M_X64
#pragma comment(linker,"/manifestdependency:\"type='win32' name='Microsoft.Windows.Common-Controls' version='6.0.0.0' processorArchitecture='amd64' publicKeyToken='6595b64144ccf1df' language='*'\"")
#else
#pragma comment(linker,"/manifestdependency:\"type='win32' name='Microsoft.Windows.Common-Controls' version='6.0.0.0' processorArchitecture='*' publicKeyToken='6595b64144ccf1df' language='*'\"")
#endif
#endif
[!endif]


