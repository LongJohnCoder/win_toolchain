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

// [!output APP_IMPL] : �w�q���ε{�������O�欰�C
//

#include "stdafx.h"
#include "[!output APP_HEADER]"
#include "[!output DIALOG_HEADER]"

#ifdef _DEBUG
#define new DEBUG_NEW
#endif


// [!output APP_CLASS]

BEGIN_MESSAGE_MAP([!output APP_CLASS], [!output APP_BASE_CLASS])
	ON_COMMAND(ID_HELP, &CWinApp::OnHelp)
END_MESSAGE_MAP()


// [!output APP_CLASS] �غc

[!output APP_CLASS]::[!output APP_CLASS]()
{
[!if RESTART_MGR_SUPPORT]
	// �䴩���s�Ұʺ޲z��
	m_dwRestartManagerSupportFlags = AFX_RESTART_MANAGER_SUPPORT_RESTART;

[!endif]
	// TODO: �b���[�J�غc�{���X�A
	// �N�Ҧ����n����l�]�w�[�J InitInstance ��
}


// �Ȧ����@�� [!output APP_CLASS] ����

[!output APP_CLASS] theApp;

[!if AUTOMATION]
const GUID CDECL BASED_CODE _tlid =
		[!output LIBID_STATIC_CONST_GUID_FORMAT];
const WORD _wVerMajor = 1;
const WORD _wVerMinor = 0;

[!endif]

// [!output APP_CLASS] ��l�]�w

BOOL [!output APP_CLASS]::InitInstance()
{
[!if MANIFEST]
	// ���p���ε{����T�M����w�ϥ� ComCtl32.dll 6 (�t) �H�᪩���A
	// �ӱҰʵ�ı�Ƽ˦��A�b Windows XP �W�A�h�ݭn InitCommonControls()�C
	// �_�h����������إ߳��N���ѡC
	INITCOMMONCONTROLSEX InitCtrls;
	InitCtrls.dwSize = sizeof(InitCtrls);
	// �]�w�n�]�t�Ҧ��z�Q�n�Ω����ε{������
	// �q�α�����O�C
	InitCtrls.dwICC = ICC_WIN95_CLASSES;
	InitCommonControlsEx(&InitCtrls);

[!endif]
	[!output APP_BASE_CLASS]::InitInstance();

[!if SOCKETS]
	if (!AfxSocketInit())
	{
		AfxMessageBox(IDP_SOCKETS_INIT_FAILED);
		return FALSE;
	}

[!endif]

[!if AUTOMATION || ACCESSIBILITY]
	// ��l�� OLE �{���w
	if (!AfxOleInit())
	{
		AfxMessageBox(IDP_OLE_INIT_FAILED);
		return FALSE;
	}

[!endif]
[!if ACTIVEX_CONTROLS]
	AfxEnableControlContainer();

[!endif]
[!if !NO_MFC_CONTROLS]
	// �إߴ߼h�޲z���A�H����ܤ���]�t
	// ����߼h���˵��δ߼h�M���˵�����C
	CShellManager *pShellManager = new CShellManager;

	// �Ұ� [Windows ���] ��ı�ƺ޲z���i�ҥ� MFC ��������D�D
	CMFCVisualManager::SetDefaultManager(RUNTIME_CLASS(CMFCVisualManagerWindows));
[!endif]

	// �зǪ�l�]�w
	// �p�G�z���ϥγo�ǥ\��åB�Q���
	// �̫᧹�����i�����ɤj�p�A�z�i�H
	// �q�U�C�{���X�������ݭn����l�Ʊ`���A
	// �ܧ��x�s�]�w�Ȫ��n�����X
	// TODO: �z���ӾA�׭ק惡�r��
	// (�Ҧp�A���q�W�٩β�´�W��)
	SetRegistryKey(_T("���� AppWizard �Ҳ��ͪ����ε{��"));
[!if AUTOMATION]
	// ��R Automation �� reg/unreg �Ѽƪ��R�O�C�C
	CCommandLineInfo cmdInfo;
	ParseCommandLine(cmdInfo);

	// �w�ϥ� /Embedding �� /Automation �ѼƱҰ����ε{���C
	// �N���ε{���� Automation ���A������C
	if (cmdInfo.m_bRunEmbedded || cmdInfo.m_bRunAutomated)
	{
		// �g�� CoRegisterClassObject() �n�����O�]�ơC
		COleTemplateServer::RegisterAll();
	}
	// �w�ϥ� /Unregserver �� /Unregister �ѼƱҰ����ε{���C
	// �q�n���������ءC
	else if (cmdInfo.m_nShellCommand == CCommandLineInfo::AppUnregister)
	{
		COleObjectFactory::UpdateRegistryAll(FALSE);
		AfxOleUnregisterTypeLib(_tlid, _wVerMajor, _wVerMinor);
		return FALSE;
	}
	// �w��W�ηf�t��L�Ѽ� (�p /Register �� /Regserver) �Ұ����ε{���C
	// ��s�n�����ءA�]�A�����{���w�C
	else
	{
		COleObjectFactory::UpdateRegistryAll();
		AfxOleRegisterTypeLib(AfxGetInstanceHandle(), _tlid);
		if (cmdInfo.m_nShellCommand == CCommandLineInfo::AppRegister)
			return FALSE;
	}
[!endif]

	[!output DIALOG_CLASS] dlg;
	m_pMainWnd = &dlg;
	INT_PTR nResponse = dlg.DoModal();
	if (nResponse == IDOK)
	{
		// TODO: �b����m��ϥ� [�T�w] �Ӱ���ϥι�ܤ����
		// �B�z���{���X
	}
	else if (nResponse == IDCANCEL)
	{
		// TODO: �b����m��ϥ� [����] �Ӱ���ϥι�ܤ����
		// �B�z���{���X
	}
	else if (nResponse == -1)
	{
		TRACE(traceAppMsg, 0, "ĵ�i: ��ܤ���إߥ��ѡA�]���A���ε{���N�~�פ�C\n");
[!if !NO_MFC_CONTROLS]
		TRACE(traceAppMsg, 0, "ĵ�i: �p�G�z�n�b��ܤ���W�ϥ� MFC ����A�h�L�k #define _AFX_NO_MFC_CONTROLS_IN_DIALOGS�C\n");
[!endif]
	}

[!if !NO_MFC_CONTROLS]
	// �R���W���ҫإߪ��߼h�޲z���C
	if (pShellManager != NULL)
	{
		delete pShellManager;
	}
[!endif]

#ifndef _AFXDLL
	ControlBarCleanUp();
#endif

	// �]���w�g������ܤ���A�Ǧ^ FALSE�A�ҥH�ڭ̷|�������ε{���A
	// �ӫD���ܶ}�l���ε{�����T���C
	return FALSE;
}

[!if AUTOMATION || ACCESSIBILITY]
int [!output APP_CLASS]::ExitInstance()
{
	AfxOleTerm(FALSE);

	return [!output APP_BASE_CLASS]::ExitInstance();
}
[!endif]
