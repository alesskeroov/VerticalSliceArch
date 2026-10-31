using System.Security.Claims;

namespace TodoApi.Common;

public static class CurrentUser
{
    // sub claim-i JWT middleware-də yoxlanır; ID heç vaxt request gövdəsindən gəlmir.
    public static Guid GetUserId(this ClaimsPrincipal user)
    {
        return Guid.Parse(user.FindFirstValue("sub")!);
    }
}
