[!if RIBBON_TOOLBAR]
// ���� �������� ��� MFC Samples ������������� ���������������� ����������������� ���������� Fluent �� ������ MFC � Microsoft Office
// ("Fluent UI") � ��������������� ������������� ��� ���������� �������� � �������� ���������� �
// ����������� �� ������ Microsoft Foundation Classes � ��������� ����������� ������������,
// ���������� � ����������� ����������� ���������� MFC C++.  
// ������� ������������� ���������� �� �����������, ������������� ��� ��������������� Fluent UI �������� ��������.  
// ��� ��������� �������������� �������� � ����� ������������ ��������� Fluent UI �������� ���-����
// http://go.microsoft.com/fwlink/?LinkId=238214.
//
// (C) ���������� ���������� (Microsoft Corp.)
// ��� ����� ��������.
[!endif]

// [!output INPLACE_FRAME_HEADER] : ��������� ������ [!output INPLACE_FRAME_CLASS]
//

#pragma once

class [!output INPLACE_FRAME_CLASS] : public [!output INPLACE_FRAME_BASE_CLASS]
{
	DECLARE_DYNCREATE([!output INPLACE_FRAME_CLASS])
public:
	[!output INPLACE_FRAME_CLASS]();

// ��������
public:

// ��������
public:

// ���������������
[!if DOCKING_TOOLBAR || TOOLBAR_STYLE_REBAR || MENUBAR_TOOLBAR || RIBBON_TOOLBAR]
	public:
	virtual BOOL OnCreateControlBars(CFrameWnd* pWndFrame, CFrameWnd* pWndDoc);
[!endif]
	virtual BOOL PreCreateWindow(CREATESTRUCT& cs);

// ����������
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

// ��������� ������� ����� ���������
protected:
	afx_msg int OnCreate(LPCREATESTRUCT lpCreateStruct);
	DECLARE_MESSAGE_MAP()
};


