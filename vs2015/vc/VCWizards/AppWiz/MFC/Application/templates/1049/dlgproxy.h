[!if RIBBON_TOOLBAR]
// ���� �������� ��� MFC Samples ������������� ���������������� ����������������� ���������� Fluent �� ������ MFC � Microsoft Office
// ("Fluent UI") � ��������������� ������������� ��� ���������� �������� � �������� ���������� �
// ����������� �� ������ Microsoft Foundation Classes � ��������� ����������� ������������,
// ���������� � ����������� ����������� ���������� MFC C++.  
// ������� ������������� ���������� �� �����������, ������������� ��� ��������������� ����������������� ���������� Fluent �������� ��������.  
// ��� ��������� �������������� �������� � ����� ������������ ��������� Fluent UI �������� ���-����
// http://go.microsoft.com/fwlink/?LinkId=238214.
//
// (C) ���������� ���������� (Microsoft Corp.)
// ��� ����� ��������.
[!endif]

// [!output DIALOG_AUTO_PROXY_HEADER]: ���� ���������
//

#pragma once

class [!output DIALOG_CLASS];


// �������� ������ ������� [!output DIALOG_AUTO_PROXY_CLASS]

class [!output DIALOG_AUTO_PROXY_CLASS] : public [!output DIALOG_AUTO_PROXY_BASE_CLASS]
{
	DECLARE_DYNCREATE([!output DIALOG_AUTO_PROXY_CLASS])

	[!output DIALOG_AUTO_PROXY_CLASS]();           // ���������� �����������, ������������ ��� ������������ ��������

// ��������
public:
	[!output DIALOG_CLASS]* m_pDialog;

// ��������
public:

// ���������������
	public:
	virtual void OnFinalRelease();

// ����������
protected:
	virtual ~[!output DIALOG_AUTO_PROXY_CLASS]();

	// ��������� ������� ����� ���������

	DECLARE_MESSAGE_MAP()
	DECLARE_OLECREATE([!output DIALOG_AUTO_PROXY_CLASS])

	// ������������� ��������� ������� ������������� ����� OLE

	DECLARE_DISPATCH_MAP()
	DECLARE_INTERFACE_MAP()
};

