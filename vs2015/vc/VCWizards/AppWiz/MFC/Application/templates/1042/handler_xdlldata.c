// dlldata.c�� �����Դϴ�.

#define REGISTER_PROXY_DLL //DllRegisterServer ���Դϴ�.

#define _WIN32_WINNT 0x0500	//WinNT 4.0 �Ǵ� DCOM�� �����Ǵ� Win95���Դϴ�.
#define USE_STUBLESS_PROXY	//MIDL ����ġ /Oicf�θ� ���ǵ˴ϴ�.

#pragma comment(lib, "rpcns4.lib")
#pragma comment(lib, "rpcrt4.lib")

#define ENTRY_PREFIX	Prx

#include "dlldata.c"
#include "[!output SAFE_IDL_NAME]_p.c"
