// dlldata.c ���]�˨禡

#define REGISTER_PROXY_DLL //DllRegisterServer ��

#define _WIN32_WINNT 0x0500	//�A�Ω�f�t DCOM �� WinNT 4.0 �� Win95
#define USE_STUBLESS_PROXY	//�ȹ� MIDL �Ѽ� /Oicf �w�q

#pragma comment(lib, "rpcns4.lib")
#pragma comment(lib, "rpcrt4.lib")

#define ENTRY_PREFIX	Prx

#include "dlldata.c"
#include "[!output SAFE_IDL_NAME]_p.c"
