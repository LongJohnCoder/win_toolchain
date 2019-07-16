// [!output PROJECT_NAME].cpp : impl�mentation des exportations de DLL.

#include "stdafx.h"
#include "resource.h"
#include "[!output SAFE_IDL_NAME]_i.h"
#include "dllmain.h"
#include "xdlldata.h"

[!if PREVIEW_HANDLER]
#include "PreviewHandler.h"
[!endif]
[!if THUMBNAIL_HANDLER]
#include "ThumbnailHandler.h"
[!endif]
[!if SEARCH_HANDLER]
#include "FilterHandler.h"
[!endif]

// Utilis� pour d�terminer si la DLL peut �tre d�charg�e par OLE.
STDAPI DllCanUnloadNow(void)
{
	HRESULT hr = PrxDllCanUnloadNow();
	if (hr != S_OK)
		return hr;
	AFX_MANAGE_STATE(AfxGetStaticModuleState());
	return (AfxDllCanUnloadNow()==S_OK && _AtlModule.GetLockCount()==0) ? S_OK : S_FALSE;
}

// Retourne une fabrique de classes pour cr�er un objet du type demand�.
STDAPI DllGetClassObject(REFCLSID rclsid, REFIID riid, LPVOID* ppv)
{
	if (PrxDllGetClassObject(rclsid, riid, ppv) == S_OK)
		return S_OK;
	return _AtlModule.DllGetClassObject(rclsid, riid, ppv);
}

// DllRegisterServer - Ajoute des entr�es � la base de registres.
STDAPI DllRegisterServer(void)
{
	// inscrit l'objet, la typelib et toutes les interfaces dans la typelib
	HRESULT hr = _AtlModule.DllRegisterServer();
	if (FAILED(hr))
		return hr;
	hr = PrxDllRegisterServer();
	return hr;
}

// DllUnregisterServer - Supprime des entr�es de la base de registres.
STDAPI DllUnregisterServer(void)
{
	HRESULT hr = _AtlModule.DllUnregisterServer();
	if (FAILED(hr))
		return hr;
	hr = PrxDllRegisterServer();
	if (FAILED(hr))
		return hr;
	hr = PrxDllUnregisterServer();
	return hr;
}

// DllInstall - Ajoute/supprime des entr�es de la base de registres par utilisateur et par ordinateur.
STDAPI DllInstall(BOOL bInstall, LPCWSTR pszCmdLine)
{
	HRESULT hr = E_FAIL;
	static const wchar_t szUserSwitch[] = _T("utilisateur");

	if (pszCmdLine != NULL)
	{
		if (_wcsnicmp(pszCmdLine, szUserSwitch, _countof(szUserSwitch)) == 0)
		{
			ATL::AtlSetPerUserRegistration(true);
		}
	}

	if (bInstall)
	{	
		hr = DllRegisterServer();
		if (FAILED(hr))
		{
			DllUnregisterServer();
		}
	}
	else
	{
		hr = DllUnregisterServer();
	}

	return hr;
}
