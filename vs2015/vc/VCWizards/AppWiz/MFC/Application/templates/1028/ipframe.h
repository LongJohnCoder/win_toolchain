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

// [!output INPLACE_FRAME_HEADER] : [!output INPLACE_FRAME_CLASS] ���O������
//

#pragma once

class [!output INPLACE_FRAME_CLASS] : public [!output INPLACE_FRAME_BASE_CLASS]
{
	DECLARE_DYNCREATE([!output INPLACE_FRAME_CLASS])
public:
	[!output INPLACE_FRAME_CLASS]();

// �ݩ�
public:

// �@�~
public:

// �мg
[!if DOCKING_TOOLBAR || TOOLBAR_STYLE_REBAR || MENUBAR_TOOLBAR || RIBBON_TOOLBAR]
	public:
	virtual BOOL OnCreateControlBars(CFrameWnd* pWndFrame, CFrameWnd* pWndDoc);
[!endif]
	virtual BOOL PreCreateWindow(CREATESTRUCT& cs);

// �{���X��@
public:
	virtual ~[!output INPLACE_FRAME_CLASS]();
#ifdef _DEBUG
	virtual void AssertValid() const;
	virtual void Dump(CDumpContext& dc) const;
#endif

protected:
[!if DOCKING_TOOLBAR || TOOLBAR_STYLE_REBAR || MENUBAR_TOOLBAR || RIBBON_TOOLBAR]
[!if MENUBAR_TOOLBAR || RIBBON_TOOLBAR]
	CMFCToolBar m_wndToolBar;
[!else]
	CToolBar    m_wndToolBar;
[!endif]
[!if TOOLBAR_STYLE_REBAR]
	CDialogBar m_wndDlgBar;
	CReBar m_wndReBar;
[!endif]
[!endif]
	COleDropTarget	m_dropTarget;
	COleResizeBar   m_wndResizeBar;

// ���ͪ��T�������禡
protected:
	afx_msg int OnCreate(LPCREATESTRUCT lpCreateStruct);
	DECLARE_MESSAGE_MAP()
};


