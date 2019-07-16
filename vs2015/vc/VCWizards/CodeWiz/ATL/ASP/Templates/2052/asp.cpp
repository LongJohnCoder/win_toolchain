// [!output IMPL_FILE] : [!output CLASS_NAME] 的实现

#include "stdafx.h"
#include "[!output HEADER_FILE]"


// [!output CLASS_NAME]

[!if !ATTRIBUTED]
[!if SUPPORT_ERROR_INFO]
STDMETHODIMP [!output CLASS_NAME]::InterfaceSupportsErrorInfo(REFIID riid)
{
	static const IID* const arr[] = 
	{
		&IID_[!output INTERFACE_NAME]
	};

	for (int i=0; i < sizeof(arr) / sizeof(arr[0]); i++)
	{
		if (InlineIsEqualGUID(*arr[i],riid))
			return S_OK;
	}
	return S_FALSE;
}
[!endif]
[!endif]

[!if ON_START_PAGE]
STDMETHODIMP [!output CLASS_NAME]::OnStartPage (IUnknown* pUnk)  
{
	if(!pUnk)
		return E_POINTER;

	CComPtr<IScriptingContext> spContext;
	HRESULT hr;

	// 获取 IScriptingContext 接口
	hr = pUnk->QueryInterface(__uuidof(IScriptingContext), (void **)&spContext);
	if(FAILED(hr))
		return hr;

[!if REQUEST]
	// 获取请求对象指针
	hr = spContext->get_Request(&m_piRequest);
	if(FAILED(hr))
	{
		return hr;
	}
[!endif]

[!if RESPONSE]
	// 获取响应对象指针
	hr = spContext->get_Response(&m_piResponse);
	if(FAILED(hr))
	{
[!if REQUEST]
		m_piRequest.Release();
[!endif]
		return hr;
	}
[!endif]
	
[!if SERVER]
	// 获取服务器对象指针
	hr = spContext->get_Server(&m_piServer);
	if(FAILED(hr))
	{
[!if REQUEST]
		m_piRequest.Release();
[!endif]
[!if RESPONSE]
		m_piResponse.Release();
[!endif]
		return hr;
	}
[!endif]
	
[!if SESSION]
	// 获取会话对象指针
	hr = spContext->get_Session(&m_piSession);
	if(FAILED(hr))
	{
[!if REQUEST]
		m_piRequest.Release();
[!endif]
[!if RESPONSE]
		m_piResponse.Release();
[!endif]
[!if SERVER]
		m_piServer.Release();
[!endif]
		return hr;
	}
[!endif]

[!if APPLICATION]
	// 获取应用程序对象指针
	hr = spContext->get_Application(&m_piApplication);
	if(FAILED(hr))
	{
[!if REQUEST]
		m_piRequest.Release();
[!endif]
[!if RESPONSE]
		m_piResponse.Release();
[!endif]
[!if SERVER]
		m_piServer.Release();
[!endif]
[!if SESSION]
		m_piSession.Release();
[!endif]
		return hr;
	}
[!endif]
	m_bOnStartPageCalled = TRUE;
	return S_OK;
}

STDMETHODIMP [!output CLASS_NAME]::OnEndPage ()  
{
	m_bOnStartPageCalled = FALSE;
	// 释放所有接口
[!if REQUEST]
	m_piRequest.Release();
[!endif]
[!if RESPONSE]
	m_piResponse.Release();
[!endif]
[!if SERVER]
	m_piServer.Release();
[!endif]
[!if SESSION]
	m_piSession.Release();
[!endif]
[!if APPLICATION]
	m_piApplication.Release();
[!endif]
	return S_OK;
}
[!endif]