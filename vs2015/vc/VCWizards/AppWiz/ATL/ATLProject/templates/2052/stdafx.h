// stdafx.h : ��׼ϵͳ�����ļ��İ����ļ���
// ���Ǿ���ʹ�õ��������ĵ�
// �ض�����Ŀ�İ����ļ�

#pragma once

#ifndef STRICT
#define STRICT
#endif

#include "targetver.h"

[!if SERVICE_APP]
#define _ATL_FREE_THREADED
[!else]
#define _ATL_APARTMENT_THREADED
[!endif]

#define _ATL_NO_AUTOMATIC_NAMESPACE

#define _ATL_CSTRING_EXPLICIT_CONSTRUCTORS	// ĳЩ CString ���캯��������ʽ��

[!if PREVIEW_HANDLER || THUMBNAIL_HANDLER || SEARCH_HANDLER]
#ifdef _MANAGED
#error ������Ϊ�йܳ��������ļ����ʹ������  ������Ŀ�����н���������������ʱ��ѡ������Ϊ��û�� CLR ֧�֡���
#endif

#ifndef _UNICODE
#error �ļ����ʹ����������� Unicode ����ʽ���ɡ�  ������Ŀ�����н����ַ�����ѡ������Ϊ��Unicode����
#endif

#define SHARED_HANDLERS

[!endif]
[!if SUPPORT_MFC]
#include <afxwin.h>
#include <afxext.h>
#include <afxole.h>
#include <afxodlgs.h>
#include <afxrich.h>
#include <afxhtml.h>
#include <afxcview.h>
#include <afxwinappex.h>
#include <afxframewndex.h>
#include <afxmdiframewndex.h>

#ifndef _AFX_NO_OLE_SUPPORT
#include <afxdisp.h>        // MFC �Զ�����
#endif // _AFX_NO_OLE_SUPPORT
[!endif]
[!if SUPPORT_COMPLUS]

#include <comsvcs.h>
[!endif]

#define ATL_NO_ASSERT_ON_DESTROY_NONEXISTENT_WINDOW

#include "resource.h"
#include <atlbase.h>
#include <atlcom.h>
#include <atlctl.h>
