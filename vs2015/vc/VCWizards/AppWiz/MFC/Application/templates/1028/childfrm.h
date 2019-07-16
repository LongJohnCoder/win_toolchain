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

// [!output CHILD_FRAME_HEADER] : [!output CHILD_FRAME_CLASS] ���O������
//

#pragma once
[!if PROJECT_STYLE_EXPLORER]
class [!output VIEW_CLASS];
[!endif]
[!if !DOCVIEW]
#include "[!output WND_VIEW_HEADER]"
[!endif]

class [!output CHILD_FRAME_CLASS] : public [!output CHILD_FRAME_BASE_CLASS]
{
	DECLARE_DYNCREATE([!output CHILD_FRAME_CLASS])
public:
	[!output CHILD_FRAME_CLASS]();

// �ݩ�
[!if APP_TYPE_MDI && SPLITTER || PROJECT_STYLE_EXPLORER]
protected:
[!if APP_TYPE_TABBED_MDI]
	CSplitterWndEx m_wndSplitter;
[!else]
	CSplitterWnd m_wndSplitter;
[!endif]
[!endif]
public:

// �@�~
public:

// �мg
[!if APP_TYPE_MDI && SPLITTER]
	public:
[!endif]
[!if PROJECT_STYLE_EXPLORER || !CHILD_FRAME_DEFAULT_STYLES || !DOCVIEW]
	public:
[!endif]
[!if APP_TYPE_MDI && SPLITTER]
	virtual BOOL OnCreateClient(LPCREATESTRUCT lpcs, CCreateContext* pContext);
[!else]
[!if PROJECT_STYLE_EXPLORER]
	virtual BOOL OnCreateClient(LPCREATESTRUCT lpcs, CCreateContext* pContext);
[!endif]
[!endif]
	virtual BOOL PreCreateWindow(CREATESTRUCT& cs);
[!if !DOCVIEW]
	virtual BOOL OnCmdMsg(UINT nID, int nCode, void* pExtra, AFX_CMDHANDLERINFO* pHandlerInfo);
[!endif]

// �{���X��@
public:
[!if !DOCVIEW]
	// �ج[�u�@�Ϫ��˵��C
	[!output WND_VIEW_CLASS] m_wndView;
[!endif]
	virtual ~[!output CHILD_FRAME_CLASS]();
#ifdef _DEBUG
	virtual void AssertValid() const;
	virtual void Dump(CDumpContext& dc) const;
#endif

[!if PROJECT_STYLE_EXPLORER]
protected:
	[!output VIEW_CLASS]* GetRightPane();
[!endif]
// ���ͪ��T�������禡
protected:
[!if !DOCVIEW]
	afx_msg void OnFileClose();
	afx_msg void OnSetFocus(CWnd* pOldWnd);
	afx_msg int OnCreate(LPCREATESTRUCT lpCreateStruct);
[!endif]
[!if PROJECT_STYLE_EXPLORER]
[!if LIST_VIEW]
	afx_msg void OnUpdateViewStyles(CCmdUI* pCmdUI);
	afx_msg void OnViewStyle(UINT nCommandID);
[!endif]
[!endif]
[!if PRINTING]
[!if RIBBON_TOOLBAR]
	afx_msg void OnFilePrint();
	afx_msg void OnFilePrintPreview();
	afx_msg void OnUpdateFilePrintPreview(CCmdUI* pCmdUI);
[!endif]
[!endif]
	DECLARE_MESSAGE_MAP()
};
