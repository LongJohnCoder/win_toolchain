[!if RIBBON_TOOLBAR]
// �o�� MFC �d�ҭ�l�{���X�|�ܽd�p��ϥ� MFC Microsoft Office Fluent �ϥΪ̤���
// (�uFluent UI�v)�A�åB�ȴ��Ѭ��ѦҸ�ơA����
// MFC �ѦҤ� MFC C++ �{���w�n��
// �H�������q�l��󪺸ɥR�C
// ���� Fluent UI ���ƻs�B�ϥΩδ��o�����v���ګh���O���ѡC
// �p�� Fluent UI ���v�p�����ԲӸ�T�A�гy�X 
// http://go.microsoft.com/fwlink/?LinkId=238214�C
//
// Copyright (C) Microsoft Corporation
// �ۧ@�v�Ҧ��A�ëO�d�@���v�Q�C
[!endif]

// [!output ROWSET_IMPL] : [!output ROWSET_CLASS] ���O����@
//

#include "stdafx.h"
#include "[!output APP_HEADER]"
#include "[!output ROWSET_HEADER]"

#ifdef _DEBUG
#define new DEBUG_NEW
#endif


// [!output ROWSET_CLASS] ��@

[!if ODBC]
[!output ROWSET_CLASS_ODBC_IMPL]
[!endif]
