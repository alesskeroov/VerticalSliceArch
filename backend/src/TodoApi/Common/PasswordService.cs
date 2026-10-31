using System.Security.Cryptography;

namespace TodoApi.Common;

public class PasswordService
{
    // PBKDF2 .NET-də hazırdır: əlavə paket olmadan yavaş və salt-lı hash yaradır.
    private const int Iterations = 600000;

    public string Hash(string password)
    {
        // Təsadüfi salt eyni parolların fərqli hash almasını təmin edir.
        var salt = RandomNumberGenerator.GetBytes(16);
        var hash = Rfc2898DeriveBytes.Pbkdf2(password, salt, Iterations, HashAlgorithmName.SHA256, 32);
        return $"{Iterations}.{Convert.ToBase64String(salt)}.{Convert.ToBase64String(hash)}";
    }

    public bool Verify(string password, string storedHash)
    {
        var parts = storedHash.Split('.');
        if (parts.Length != 3 || !int.TryParse(parts[0], out var iterations) ||
            iterations < 100000 || iterations > 1000000) return false;
        try
        {
            var salt = Convert.FromBase64String(parts[1]);
            var expected = Convert.FromBase64String(parts[2]);
            if (salt.Length != 16 || expected.Length != 32) return false;
            var actual = Rfc2898DeriveBytes.Pbkdf2(password, salt, iterations, HashAlgorithmName.SHA256, 32);
            // Müqayisə ilk fərqli baytda dayanmasın; vaxt fərqindən məlumat sızmasın.
            return CryptographicOperations.FixedTimeEquals(actual, expected);
        }
        catch (FormatException) { return false; }
    }
}
