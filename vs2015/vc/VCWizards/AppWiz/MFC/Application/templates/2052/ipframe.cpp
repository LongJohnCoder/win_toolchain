[!if RIBBON_TOOLBAR]
// ��� MFC ʾ��Դ������ʾ���ʹ�� MFC Microsoft Office Fluent �û����� 
// (��Fluent UI��)����ʾ�������ο���
// ���Բ��䡶Microsoft ������ο����� 
// MFC C++ ������渽����ص����ĵ���  
// ���ơ�ʹ�û�ַ� Fluent UI ����������ǵ����ṩ�ġ�  
// ��Ҫ�˽��й� Fluent UI ��ɼƻ�����ϸ��Ϣ������� 
// http://go.microsoft.com/fwlink/?LinkId=238214��
//
// ��Ȩ����(C) Microsoft Corporation
// ��������Ȩ����
[!endif]

// [!output INPLACE_FRAME_IMPL] : [!output INPLACE_FRAME_CLASS] ���ʵ��
//

#include "stdafx.h"
#include "[!output APP_HEADER]"

#include "[!output INPLACE_FRAME_HEADER]"

#ifdef _DEBUG
#define new DEBUG_NEW
#endif


// [!output INPLACE_FRAME_CLASS]

IMPLEMENT_DYNCREATE([!output INPLACE_FRAME_CLASS], [!output INPLACE_FRAME_BASE_CLASS])

BEGIN_MESSAGE_MAP([!output INPLACE_FRAME_CLASS], [!output INPLACE_FRAME_BASE_CLASS])
	ON_WM_CREATE()
END_MESSAGE_MAP()


// [!output INPLACE_FRAME_CLASS] ����/����

[!output INPLACE_FRAME_CLASS]::[!output INPLACE_FRAME_CLASS]()
{
[!if ACCESSIBILITY]
	EnableActiveAccessibility();
[!endif]
}

[!output INPLACE_FRAME_CLASS]::~[!output INPLACE_FRAME_CLASS]()
{
}

int [!output INPLACE_FRAME_CLASS]::OnCreate(LPCREATESTRUCT lpCreateStruct)
{
	if ([!output INPLACE_FRAME_BASE_CLASS]::OnCreate(lpCreateStruct) == -1)
		return -1;

	// CResizeBar ʵ�־͵ص�����С��
	if (!m_wndResizeBar.Create(this))
	{
		TRACE0("Failed to create resize bar\n");
		return -1;      // δ�ܴ���
	}

	// Ĭ������£����ע��һ�����ܴ���
	//  �޹صķ���Ŀ�ꡣ  �⽫��ֹ
	//  �ϷŶ��󡰴����֧���Ϸŵ������С�
	m_dropTarget.Register(this);

	return 0;
}

[!if DOCKING_TOOLBAR || TOOLBAR_STYLE_REBAR || MENUBAR_TOOLBAR  || RIBBON_TOOLBAR]
// ��ܽ����� OnCreateControlBars �Ա���
//  ����Ӧ�ó���Ĵ����ϴ����ؼ�����  pWndFrame �������Ķ�����ܴ��ڣ�
//  ����ʼ�ղ�Ϊ NULL��  pWndDoc ���ĵ�����ܴ��ڣ�
//  ������������ SDI Ӧ�ó���ʱΪ NULL��
//  ������Ӧ�ó�����Խ� MFC �ؼ������������������е��κ�һ���ϡ�
BOOL [!output INPLACE_FRAME_CLASS]::OnCreateControlBars(CFrameWnd* pWndFrame, CFrameWnd* pWndDoc)
{
	// ���ʹ�� pWndDoc���򽫴��Ƴ�
	UNREFERENCED_PARAMETER(pWndDoc);

	// ���ô˴��ڵ������ߣ��Ա㽫��Ϣ���͵���ȷ��Ӧ�ó���
	m_wndToolBar.SetOwner(this);

[!if MENUBAR_TOOLBAR || RIBBON_TOOLBAR]
	if (![!output INPLACE_FRAME_BASE_CLASS]::OnCreateControlBars(pWndFrame, pWndDoc))
	{
		return FALSE;
	}

	COleCntrFrameWndEx* pNewFrame = DYNAMIC_DOWNCAST(COleCntrFrameWndEx, m_pMainFrame);
	ASSERT_VALID(pNewFrame);
[!endif]

	// �ڿͻ��˵Ŀ�ܴ����ϴ���������
[!if TOOLBAR_STYLE_REBAR]
	if (!m_wndToolBar.CreateEx(pWndFrame, TBSTYLE_FLAT | TBSTYLE_TRANSPARENT) ||
[!else]
[!if MENUBAR_TOOLBAR || RIBBON_TOOLBAR]
	if (!m_wndToolBar.CreateEx(pNewFrame, TBSTYLE_FLAT,WS_CHILD | WS_VISIBLE | CBRS_TOP
		| CBRS_GRIPPER | CBRS_TOOLTIPS | CBRS_FLYBY | CBRS_SIZE_DYNAMIC) ||
[!else]
	if (!m_wndToolBar.CreateEx(pWndFrame, TBSTYLE_FLAT,WS_CHILD | WS_VISIBLE | CBRS_TOP
		| CBRS_GRIPPER | CBRS_TOOLTIPS | CBRS_FLYBY | CBRS_SIZE_DYNAMIC) ||
[!endif]
[!endif]
[!if APP_TYPE_MDI]
[!if MENUBAR_TOOLBAR]
		!m_wndToolBar.LoadToolBar(theApp.m_bHiColorIcons ? IDR_[!output SAFE_DOC_TYPE_NAME]TYPE_SRVR_IP_256 : IDR_[!output SAFE_DOC_TYPE_NAME]TYPE_SRVR_IP))
[!else]
		!m_wndToolBar.LoadToolBar(IDR_[!output SAFE_DOC_TYPE_NAME]TYPE_SRVR_IP))
[!endif]
[!else]
[!if MENUBAR_TOOLBAR]
		!m_wndToolBar.LoadToolBar(theApp.m_bHiColorIcons ? IDR_SRVR_INPLACE_256 : IDR_SRVR_INPLACE))
[!else]
		!m_wndToolBar.LoadToolBar(IDR_SRVR_INPLACE))
[!endif]
[!endif]
	{
		TRACE0("Failed to create toolbar\n");
		return FALSE;
	}

[!if TOOLBAR_STYLE_REBAR]
	// ���ô˴��ڵ������ߣ��Ա㽫��Ϣ���͵���ȷ��Ӧ�ó���
	m_wndDlgBar.SetOwner(this);

	// �ڿͻ��˵Ŀ�ܴ����ϴ����Ի���
[!if APP_TYPE_MDI]
	if (!m_wndDlgBar.Create(pWndFrame, IDR_[!output SAFE_DOC_TYPE_NAME]TYPE_SRVR_IP, 
[!else]
	if (!m_wndDlgBar.Create(pWndFrame, IDR_SRVR_INPLACE,
[!endif]
		CBRS_ALIGN_TOP, AFX_IDW_DIALOGBAR))
	{
		TRACE0("Failed to create dialogbar\n");
		return FALSE;
	}

	// ���ô˴��ڵ������ߣ��Ա㽫��Ϣ���͵���ȷ��Ӧ�ó���
	m_wndReBar.SetOwner(this);

	// �ڿͻ��˵Ŀ�ܴ����ϴ��� Rebar
	if (!m_wndReBar.Create(pWndFrame) ||
		!m_wndReBar.AddBar(&m_wndToolBar) ||
		!m_wndReBar.AddBar(&m_wndDlgBar))
	{
		TRACE0("Failed to create rebar\n");
		return FALSE;
	}

[!else]
	// TODO: �������Ҫ��ͣ������������ɾ��������
	m_wndToolBar.EnableDocking(CBRS_ALIGN_ANY);
[!if MENUBAR_TOOLBAR || RIBBON_TOOLBAR]
	pNewFrame->EnableDocking(CBRS_ALIGN_ANY);
	pNewFrame->DockPane(&m_wndToolBar);

	// TODO: �������Ҫ������ʾ���򽫴��Ƴ�
	m_wndToolBar.SetControlBarStyle(m_wndToolBar.GetPaneStyle() |
		CBRS_TOOLTIPS | CBRS_FLYBY);
[!else]
	pWndFrame->EnableDocking(CBRS_ALIGN_ANY);
	pWndFrame->DockControlBar(&m_wndToolBar);
[!endif]
[!endif]

	return TRUE;
}

[!endif]
BOOL [!output INPLACE_FRAME_CLASS]::PreCreateWindow(CREATESTRUCT& cs)
{
	// TODO: �ڴ˴�ͨ���޸� CREATESTRUCT cs ���޸Ĵ��������ʽ

	return [!output INPLACE_FRAME_BASE_CLASS]::PreCreateWindow(cs);
}


// [!output INPLACE_FRAME_CLASS] ���

#ifdef _DEBUG
void [!output INPLACE_FRAME_CLASS]::AssertValid() const
{
	[!output INPLACE_FRAME_BASE_CLASS]::AssertValid();
}

void [!output INPLACE_FRAME_CLASS]::Dump(CDumpContext& dc) const
{
	[!output INPLACE_FRAME_BASE_CLASS]::Dump(dc);
}
#endif //_DEBUG


// [!output INPLACE_FRAME_CLASS] ����

