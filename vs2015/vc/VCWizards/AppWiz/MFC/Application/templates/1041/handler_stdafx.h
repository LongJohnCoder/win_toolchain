// stdafx.h : �W���̃V�X�e�� �C���N���[�h �t�@�C���̃C���N���[�h �t�@�C���A�܂���
// �Q�Ɖ񐔂������A�����܂�ύX����Ȃ��A�v���W�F�N�g��p�̃C���N���[�h �t�@�C��
// ���L�q���܂��B

#pragma once

#ifndef STRICT
#define STRICT
#endif

#include "targetver.h"

#define _ATL_APARTMENT_THREADED
#define _ATL_NO_AUTOMATIC_NAMESPACE

#define _ATL_CSTRING_EXPLICIT_CONSTRUCTORS	// �ꕔ�� CString �R���X�g���N�^�[�͖����I�ł��B

#ifdef _MANAGED
#error �t�@�C���̎�ނ̃n���h���[���}�l�[�W �A�Z���u���Ƃ��ăr���h���邱�Ƃ͂ł��܂���B�v���W�F�N�g �v���p�e�B�ŋ��ʌ��ꃉ���^�C�� �I�v�V������ CLR �T�|�[�g�Ȃ��ɐݒ肵�Ă��������B
#endif

#ifndef _UNICODE
#error �t�@�C���̎�ނ̃n���h���[�� Unicode �Ńr���h����K�v������܂��B�v���W�F�N�g �v���p�e�B�ŕ����Z�b�g �I�v�V������ Unicode �ɐݒ肵�Ă��������B
#endif

#define SHARED_HANDLERS

#include <afxwin.h>
#include <afxext.h>
#include <afxole.h>
#include <afxodlgs.h>
#include <afxrich.h>
#include <afxhtml.h>
#include <afxcview.h>
#include <afxwinappex.h>
#include <afxframewndex.h>
#include <afxmdiframewndex.h>
[!if CONTAINER_SERVER || FULL_SERVER || MINI_SERVER]
#include <afxoleserverdocex.h>
[!endif]

#ifndef _AFX_NO_OLE_SUPPORT
#include <afxdisp.h>        // MFC �I�[�g���[�V���� �N���X
#endif // _AFX_NO_OLE_SUPPORT

#define ATL_NO_ASSERT_ON_DESTROY_NONEXISTENT_WINDOW

#include "resource.h"
[!if FULL_SERVER || MINI_SERVER]
#include "..\[!output BASE_PROJECT_NAME]\resource.h"
[!endif]
#include <atlbase.h>
#include <atlcom.h>
#include <atlctl.h>
