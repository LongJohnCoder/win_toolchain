[!if RIBBON_TOOLBAR]
// ���� MFC �T���v�� �\�[�X �R�[�h�ł́AMFC Microsoft Office Fluent ���[�U�[ �C���^�[�t�F�C�X 
// ("Fluent UI") �̎g�p���@�������܂��B���̃R�[�h�́AMFC C++ ���C�u���� �\�t�g�E�F�A�� 
// ��������Ă��� Microsoft Foundation Class ���t�@�����X����ъ֘A�d�q�h�L�������g��
// �⊮���邽�߂̎Q�l�����Ƃ��Ē񋟂���܂��B
// Fluent UI �𕡐��A�g�p�A�܂��͔z�z���邽�߂̃��C�Z���X�����͌ʂɗp�ӂ���Ă��܂��B
// Fluent UI ���C�Z���X �v���O�����̏ڍׂɂ��ẮAWeb �T�C�g
// http://go.microsoft.com/fwlink/?LinkId=238214 ���Q�Ƃ��Ă��������B
//
// Copyright (C) Microsoft Corporation
// All rights reserved.
[!endif]

// [!output WND_VIEW_HEADER] : [!output WND_VIEW_CLASS] �N���X�̃C���^�[�t�F�C�X
//


#pragma once


// [!output WND_VIEW_CLASS] �E�B���h�E

class [!output WND_VIEW_CLASS] : public [!output WND_VIEW_BASE_CLASS]
{
// �R���X�g���N�V����
public:
	[!output WND_VIEW_CLASS]();

// ����
public:

// ����
public:

// �I�[�o�[���C�h
	protected:
	virtual BOOL PreCreateWindow(CREATESTRUCT& cs);

// ����
public:
	virtual ~[!output WND_VIEW_CLASS]();

	// �������ꂽ�A���b�Z�[�W���蓖�Ċ֐�
protected:
	afx_msg void OnPaint();
	DECLARE_MESSAGE_MAP()
};

