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

// [!output WND_VIEW_HEADER] : [!output WND_VIEW_CLASS] ���O������
//


#pragma once


// [!output WND_VIEW_CLASS] ����

class [!output WND_VIEW_CLASS] : public [!output WND_VIEW_BASE_CLASS]
{
// �غc
public:
	[!output WND_VIEW_CLASS]();

// �ݩ�
public:

// �@�~
public:

// �мg
	protected:
	virtual BOOL PreCreateWindow(CREATESTRUCT& cs);

// �{���X��@
public:
	virtual ~[!output WND_VIEW_CLASS]();

	// ���ͪ��T�������禡
protected:
	afx_msg void OnPaint();
	DECLARE_MESSAGE_MAP()
};

