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

// [!output DIALOG_AUTO_PROXY_HEADER]: �w�b�_�[ �t�@�C��
//

#pragma once

class [!output DIALOG_CLASS];


// [!output DIALOG_AUTO_PROXY_CLASS] �R�}���h �^�[�Q�b�g

class [!output DIALOG_AUTO_PROXY_CLASS] : public [!output DIALOG_AUTO_PROXY_BASE_CLASS]
{
	DECLARE_DYNCREATE([!output DIALOG_AUTO_PROXY_CLASS])

	[!output DIALOG_AUTO_PROXY_CLASS]();           // ���I�����Ŏg�p����� protected �R���X�g���N�^�[

// ����
public:
	[!output DIALOG_CLASS]* m_pDialog;

// ����
public:

// �I�[�o�[���C�h
	public:
	virtual void OnFinalRelease();

// ����
protected:
	virtual ~[!output DIALOG_AUTO_PROXY_CLASS]();

	// �������ꂽ�A���b�Z�[�W���蓖�Ċ֐�

	DECLARE_MESSAGE_MAP()
	DECLARE_OLECREATE([!output DIALOG_AUTO_PROXY_CLASS])

	// �������ꂽ OLE �f�B�X�p�b�`���蓖�Ċ֐�

	DECLARE_DISPATCH_MAP()
	DECLARE_INTERFACE_MAP()
};

