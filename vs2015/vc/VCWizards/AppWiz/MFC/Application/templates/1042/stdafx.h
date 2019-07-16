[!if RIBBON_TOOLBAR]
// �� MFC ���� �ҽ� �ڵ�� MFC Microsoft Office Fluent ����� �������̽�("Fluent UI")�� 
// ����ϴ� ����� ���� �ָ�, MFC C++ ���̺귯�� ����Ʈ��� ���Ե� 
// Microsoft Foundation Classes Reference �� ���� ���� ������ ���� 
// �߰������� �����Ǵ� �����Դϴ�.  
// Fluent UI�� ����, ��� �Ǵ� �����ϴ� �� ���� ��� ����� ������ �����˴ϴ�.  
// Fluent UI ���̼��� ���α׷��� ���� �ڼ��� ������ 
// http://go.microsoft.com/fwlink/?LinkId=238214.
//
// Copyright (C) Microsoft Corporation
// All rights reserved.
[!endif]

// stdafx.h : ���� ��������� ���� ��������� �ʴ�
// ǥ�� �ý��� ���� ���� �� ������Ʈ ���� ���� ������ 
// ��� �ִ� ���� �����Դϴ�.

#pragma once

#ifndef VC_EXTRALEAN
#define VC_EXTRALEAN            // ���� ������ �ʴ� ������ Windows ������� �����մϴ�.
#endif

#include "targetver.h"

#define _ATL_CSTRING_EXPLICIT_CONSTRUCTORS      // �Ϻ� CString �����ڴ� ��������� ����˴ϴ�.
[!if NO_MFC_CONTROLS]
#define _AFX_NO_MFC_CONTROLS_IN_DIALOGS         // ��ȭ ���ڿ��� MFC ��Ʈ�ѿ� ���� ������ �����մϴ�.
[!endif]

// MFC�� ���� �κа� ���� ������ ��� �޽����� ���� ����⸦ �����մϴ�.
#define _AFX_ALL_WARNINGS

#include <afxwin.h>         // MFC �ٽ� �� ǥ�� ���� ����Դϴ�.
#include <afxext.h>         // MFC Ȯ���Դϴ�.
[!if APP_TYPE_MTLD && !DOCVIEW]
#include <afxtempl.h>           // MFC �÷��� Ŭ�����Դϴ�.
[!endif]
[!if TREE_VIEW || LIST_VIEW || PROJECT_STYLE_EXPLORER]
#include <afxcview.h>
[!endif]

[!if CONTAINER || MINI_SERVER || FULL_SERVER || CONTAINER_SERVER]
#include <afxole.h>         // MFC OLE Ŭ�����Դϴ�.
[!if CONTAINER || CONTAINER_SERVER]
#include <afxodlgs.h>       // MFC OLE ��ȭ ���� Ŭ�����Դϴ�.
[!endif]
[!endif]

[!if AUTOMATION || ACTIVEX_CONTROLS]
#include <afxdisp.h>        // MFC �ڵ�ȭ Ŭ�����Դϴ�.
[!endif]

[!if ACTIVE_DOC_SERVER]
#include <afxdocob.h>
[!endif]

[!if DB_SUPPORT_HEADER_ONLY || DB_VIEW_NO_FILE]
 // ���⿡�� �ּ����� DB ������ ��û�մϴ�.  ���õ� �䰡 �����ϴ�.
[!endif]
[!if DB_VIEW_WITH_FILE]
 // ���⿡�� �信 ���� DB ������ ���õ˴ϴ�.
[!endif]

#ifndef _AFX_NO_OLE_SUPPORT
#include <afxdtctl.h>           // Internet Explorer 4 ���� ��Ʈ�ѿ� ���� MFC �����Դϴ�.
#endif
#ifndef _AFX_NO_AFXCMN_SUPPORT
#include <afxcmn.h>             // Windows ���� ��Ʈ�ѿ� ���� MFC �����Դϴ�.
#endif // _AFX_NO_AFXCMN_SUPPORT
[!if MENUBAR_TOOLBAR || RIBBON_TOOLBAR || USE_VISUAL_MANAGER]

#include <afxcontrolbars.h>     // MFC�� ���� �� ��Ʈ�� ���� ����
[!endif]

[!if HTML_VIEW || HTML_EDITVIEW]
#include <afxhtml.h>                    // MFC HTML �� ����
[!endif]

[!if SOCKETS]
#include <afxsock.h>            // MFC ���� Ȯ��
[!endif]

[!if RICH_EDIT_VIEW]
#include <afxrich.h>            // MFC rich edit Ŭ����
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
#include <afxdhtml.h>        // HTML ��ȭ ����
[!endif]

[!if APP_TYPE_DLG]
[!if AUTOMATION]
// �� ��ũ�δ� COleObjectFactory �����ڿ� ���� bMultiInstance �Ű� ������ TRUE��
// �����ϴ� ���� �����ϸ� IMPLEMENT_OLECREATE�� �����ϴ�.
// �ڵ�ȭ ��Ʈ�ѷ����� ��û�� �� �ڵ�ȭ ���Ͻ� ��ü�� ����
// �� ���� ���α׷��� ���� ������ �ν��Ͻ��� ���۵ǵ��� �մϴ�.
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


