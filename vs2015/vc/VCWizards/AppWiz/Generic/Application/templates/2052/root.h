[!if DLL_APP]
// ���� ifdef ���Ǵ���ʹ�� DLL �������򵥵�
// ��ı�׼�������� DLL �е������ļ��������������϶���� [!output UPPER_CASE_SAFE_PROJECT_IDENTIFIER_NAME]_EXPORTS
// ���ű���ġ���ʹ�ô� DLL ��
// �κ�������Ŀ�ϲ�Ӧ����˷��š�������Դ�ļ��а������ļ����κ�������Ŀ���Ὣ
// [!output UPPER_CASE_SAFE_PROJECT_IDENTIFIER_NAME]_API ������Ϊ�Ǵ� DLL ����ģ����� DLL ���ô˺궨���
// ������Ϊ�Ǳ������ġ�
#ifdef [!output UPPER_CASE_SAFE_PROJECT_IDENTIFIER_NAME]_EXPORTS
#define [!output UPPER_CASE_SAFE_PROJECT_IDENTIFIER_NAME]_API __declspec(dllexport)
#else
#define [!output UPPER_CASE_SAFE_PROJECT_IDENTIFIER_NAME]_API __declspec(dllimport)
#endif

// �����Ǵ� [!output PROJECT_NAME].dll ������
class [!output UPPER_CASE_SAFE_PROJECT_IDENTIFIER_NAME]_API C[!output SAFE_PROJECT_IDENTIFIER_NAME] {
public:
	C[!output SAFE_PROJECT_IDENTIFIER_NAME](void);
	// TODO:  �ڴ�������ķ�����
};

extern [!output UPPER_CASE_SAFE_PROJECT_IDENTIFIER_NAME]_API int n[!output SAFE_PROJECT_IDENTIFIER_NAME];

[!output UPPER_CASE_SAFE_PROJECT_IDENTIFIER_NAME]_API int fn[!output SAFE_PROJECT_IDENTIFIER_NAME](void);
[!else]
#pragma once

#include "resource.h"
[!endif]
