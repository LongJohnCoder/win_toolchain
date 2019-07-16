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

// [!output APP_HEADER] : [!output PROJECT_NAME] �A�v���P�[�V�����̃��C�� �w�b�_�[ �t�@�C��
//
#pragma once

#ifndef __AFXWIN_H__
	#error "PCH �ɑ΂��Ă��̃t�@�C�����C���N���[�h����O�� 'stdafx.h' ���C���N���[�h���Ă�������"
#endif

#include "resource.h"       // ���C�� �V���{��


// [!output APP_CLASS]:
// ���̃N���X�̎����ɂ��ẮA[!output APP_IMPL] ���Q�Ƃ��Ă��������B
//

class [!output APP_CLASS] : public [!output APP_BASE_CLASS]
{
public:
	[!output APP_CLASS]();

[!if APP_TYPE_MTLD]
[!if !DOCVIEW]
	CArray<HWND, HWND> m_aryFrames;
[!else]
protected:
	CMultiDocTemplate* m_pDocTemplate;
[!endif]
public:
[!endif]

// �I�[�o�[���C�h
public:
	virtual BOOL InitInstance();
[!if CONTAINER || MINI_SERVER || FULL_SERVER || CONTAINER_SERVER || AUTOMATION || OLEDB || ACTIVEX_CONTROLS || ACCESSIBILITY || RIBBON_TOOLBAR || APP_TYPE_MDI || !DOCVIEW]
	virtual int ExitInstance();
[!endif]

// ����
[!if FULL_SERVER || MINI_SERVER || CONTAINER_SERVER || AUTOMATION]
	COleTemplateServer m_server;
		// �h�L�������g���쐬���邽�߂̃T�[�o�[ �I�u�W�F�N�g
[!endif]
[!if !DOCVIEW]
[!if !APP_TYPE_SDI]
protected:
	HMENU  m_hMDIMenu;
	HACCEL m_hMDIAccel;
[!endif]

public:
[!endif]
[!if ENABLE_VISUAL_STYLE_SWITCHING]
	UINT  m_nAppLook;
[!endif]
[!if MENUBAR_TOOLBAR || ADV_DOCKING_EXPLORER || ADV_DOCKING_OUTPUT || ADV_DOCKING_PROPERTIES || ADV_DOCKING_NAVIGATION]
	BOOL  m_bHiColorIcons;

[!endif]
[!if MENUBAR_TOOLBAR || RIBBON_TOOLBAR]
	virtual void PreLoadState();
	virtual void LoadCustomState();
	virtual void SaveCustomState();

[!endif]
	afx_msg void OnAppAbout();
[!if !DOCVIEW]
[!if APP_TYPE_MDI]
	afx_msg void OnFileNew();
[!endif]
[!endif]
[!if APP_TYPE_MTLD]
	afx_msg void OnFileNewFrame();
[!if DOCVIEW]
	afx_msg void OnFileNew();
[!endif]
[!endif]
	DECLARE_MESSAGE_MAP()
};

extern [!output APP_CLASS] theApp;
