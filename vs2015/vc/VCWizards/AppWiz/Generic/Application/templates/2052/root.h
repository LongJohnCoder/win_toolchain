[!if DLL_APP]
// 下列 ifdef 块是创建使从 DLL 导出更简单的
// 宏的标准方法。此 DLL 中的所有文件都是用命令行上定义的 [!output UPPER_CASE_SAFE_PROJECT_IDENTIFIER_NAME]_EXPORTS
// 符号编译的。在使用此 DLL 的
// 任何其他项目上不应定义此符号。这样，源文件中包含此文件的任何其他项目都会将
// [!output UPPER_CASE_SAFE_PROJECT_IDENTIFIER_NAME]_API 函数视为是从 DLL 导入的，而此 DLL 则将用此宏定义的
// 符号视为是被导出的。
#ifdef [!output UPPER_CASE_SAFE_PROJECT_IDENTIFIER_NAME]_EXPORTS
#define [!output UPPER_CASE_SAFE_PROJECT_IDENTIFIER_NAME]_API __declspec(dllexport)
#else
#define [!output UPPER_CASE_SAFE_PROJECT_IDENTIFIER_NAME]_API __declspec(dllimport)
#endif

// 此类是从 [!output PROJECT_NAME].dll 导出的
class [!output UPPER_CASE_SAFE_PROJECT_IDENTIFIER_NAME]_API C[!output SAFE_PROJECT_IDENTIFIER_NAME] {
public:
	C[!output SAFE_PROJECT_IDENTIFIER_NAME](void);
	// TODO:  在此添加您的方法。
};

extern [!output UPPER_CASE_SAFE_PROJECT_IDENTIFIER_NAME]_API int n[!output SAFE_PROJECT_IDENTIFIER_NAME];

[!output UPPER_CASE_SAFE_PROJECT_IDENTIFIER_NAME]_API int fn[!output SAFE_PROJECT_IDENTIFIER_NAME](void);
[!else]
#pragma once

#include "resource.h"
[!endif]
